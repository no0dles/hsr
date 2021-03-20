import { createBrotliCompress, createBrotliDecompress, brotliCompress, constants } from 'zlib'
import { HttpRequest } from '../../server/http-request'
import { HttpMiddleware } from '../../server/http-middleware'
import { HttpResponse } from '../../server/http-response'
import { readableToBuffer } from '../../server/http-request-impl'
import { HttpClientMiddleware } from '../../../hsr-browser/http-client-middleware'
import { HttpClient } from '../../../hsr-browser/http-client'
import { HttpNodeClientResponse } from '../../client/http-node-client-response'

export function nodeBrotliClient(): HttpClientMiddleware<HttpNodeClientResponse, {}> {
  return {
    handleRequest(res: HttpClient<any>): HttpClient<any> {
      return res.header('Accept-Encoding', 'br')
    },
    handleResponse(res: HttpNodeClientResponse): Promise<{}> | {} {
      res.bodyAsString = async () => {
        if (res.hasHeaderValue('Content-Encoding', 'br')) {
          const stream = createBrotliDecompress()
          res.message.pipe(stream)
          const buffer = await readableToBuffer(stream)
          return buffer.toString()
        } else {
          const buffer = await readableToBuffer(res.message)
          return buffer.toString()
        }
      }
      return res
    },
  }
}

export function brotli(): HttpMiddleware<HttpRequest, HttpResponse, HttpRequest, HttpResponse> {
  return async (ctx) => {
    const result = await ctx.next(ctx.req, ctx.res)
    const body = result.body()
    if (!body || result.hasHeader('Content-Encoding')) {
      return result
    }

    const acceptBrotli = ctx.req.hasHeaderValue('accept-encoding', 'br')

    if (acceptBrotli) {
      if (typeof body === 'string' || body instanceof Buffer) {
        return new Promise<HttpResponse>((resolve, reject) => {
          brotliCompress(body, (err, data) => {
            if (err) {
              reject(err)
            } else {
              resolve(
                result.header('Content-Length', data.length.toString()).header('Content-Encoding', 'br').body(data)
              )
            }
          })
        })
      } else {
        const compress = createBrotliCompress({
          params: {
            [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_TEXT,
          },
        })

        return result.header('Content-Encoding', 'br').body(body.pipe(compress))
      }
    } else {
      return result
    }
  }
}

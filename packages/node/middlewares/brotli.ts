import { createBrotliCompress, createBrotliDecompress, brotliCompress, constants } from 'zlib'
import { HttpRequest } from '../http-request'
import { HttpMiddleware } from '../http-middleware'
import { HttpResponse } from '../http-response'
import { HttpClient, HttpClientMiddleware } from '../../browser/http-client'
import { HttpNodeClientResponse } from '../http-client-response-impl'
import { readableToBuffer } from '../http-request-impl'

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
    }
  }
}

export function brotli(): HttpMiddleware<HttpRequest,
  HttpResponse,
  HttpRequest,
  HttpResponse> {
  return async (ctx) => {
    const result = await ctx.next(ctx.req, ctx.res)
    const body = result.body()
    if (!body) {
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
              resolve(result
                .header('Content-Length', data.length.toString())
                .header('Content-Encoding', 'br')
                .body(data))
            }
          })
        })
      } else {
        const compress = createBrotliCompress({
          params: {
            [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_TEXT,
          },
        })

        return result
          .header('Content-Encoding', 'br')
          .body(body.pipe(compress))
      }
    } else {
      return result
    }
  }
}

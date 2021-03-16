import { createBrotliCompress, brotliCompress, constants } from 'zlib'
import { HttpRequest } from '../http-request'
import { HttpMiddleware } from '../http-middleware'
import { HttpResponse } from '../http-response'


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

    if (typeof body === 'string' || body instanceof Buffer) {
      return new Promise<HttpResponse>((resolve, reject) => {
        brotliCompress(body, (err, data) => {
          if (err) {
            reject(err)
          } else {
            resolve(result
              .header('Content-Length', body.length.toString())
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
  }
}

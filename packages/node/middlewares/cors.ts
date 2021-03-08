import { HttpRequest } from '../http-request'
import { HttpMiddleware } from '../http-middleware'
import { HttpResponse } from '../http-response'

export type HttpCorsMiddleware = HttpMiddleware<HttpRequest, HttpResponse, HttpRequest, HttpResponse>

export function cors(): HttpCorsMiddleware {
  return async (ctx) => {
    const requestOrigin = ctx.req.headerAsString('origin') ?? '*'
    if (ctx.req.method === 'OPTIONS') {
      const allowedHeaders = ctx.req.header('access-control-request-headers') ?? ''
      return {
        statusCode: 204,
        headers: {
          'Access-Control-Allow-Origin': requestOrigin,
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Headers': allowedHeaders,
          //'Access-Control-Expose-Headers': '',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,HEAD,PATCH',
          'Content-Length': '0',
          //Vary: 'Origin, Access-Control-Request-Headers',
        },
      }
    } else {
      const res = await ctx.next(ctx.req)
      if (!res.headers) {
        res.headers = {}
      }
      if (!res.headers['Access-Control-Allow-Origin']) {
        res.headers['Access-Control-Allow-Origin'] = requestOrigin
      }
      if (!res.headers['Access-Control-Allow-Credentials']) {
        res.headers['Access-Control-Allow-Credentials'] = 'true'
      }
      return res
    }
  }
}

import { HttpRequest } from '../../server/http-request'
import { HttpMiddleware } from '../../server/http-middleware'
import { HttpResponse } from '../../server/http-response'

export type HttpCorsMiddleware = HttpMiddleware<HttpRequest, HttpResponse, HttpRequest, HttpResponse>

export function cors(): HttpCorsMiddleware {
  return async (ctx) => {
    const requestOrigin = ctx.req.headerAsString('origin') ?? '*'
    if (ctx.req.method === 'OPTIONS') {
      const allowedHeaders = ctx.req.header('access-control-request-headers') ?? ''
      return ctx.res
        .statusCode(204)
        .header('Access-Control-Allow-Origin', requestOrigin)
        .header('Access-Control-Allow-Credentials', 'true')
        .header('Access-Control-Allow-Headers', allowedHeaders)
        .header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,HEAD,PATCH')
        .header('Content-Length', '0')
    } else {
      const res = await ctx.next(ctx.req, ctx.res)
      if (!res.header('Access-Control-Allow-Origin')) {
        res.header('Access-Control-Allow-Origin', requestOrigin)
      }
      if (!res.header('Access-Control-Allow-Credentials')) {
        res.header('Access-Control-Allow-Credentials', 'true')
      }
      return res
    }
  }
}

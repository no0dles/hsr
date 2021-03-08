import { HttpRequest } from '../http-request'
import { HttpMiddleware } from '../http-middleware'
import { HttpResponse } from '../http-response'

export interface HttpBodyRequest extends HttpRequest {
  bodyAsJson(): Promise<any>
}

export type HttpBodyMiddleware = HttpMiddleware<HttpRequest, HttpResponse, HttpBodyRequest, HttpResponse>

export function jsonBody(): HttpBodyMiddleware {
  return (ctx) => {
    const newReq = ctx.req as HttpBodyRequest
    newReq.bodyAsJson = async () => {
      const data = await ctx.req.bodyAsString()
      return JSON.parse(data)
    }
    return ctx.next(newReq)
  }
}

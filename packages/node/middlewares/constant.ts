import { HttpRequest } from '../http-request'
import { HttpMiddleware } from '../http-middleware'
import { HttpResponse } from '../http-response'

export interface HttpConstantRequest<K extends string | number | symbol, V> extends HttpRequest {
  constant: Record<K, V>
}

export type HttpConstantMiddleware<K extends string | number | symbol, V> = HttpMiddleware<
  HttpRequest,
  HttpResponse,
  HttpConstantRequest<K, V>,
  HttpResponse
>

export function constant<K, V>(name: keyof K, value: V): HttpConstantMiddleware<typeof name, V> {
  return async (ctx) => {
    const constant = (<any>ctx.req).constant ?? {}
    constant[name] = value
    const newReq = ctx.req as HttpConstantRequest<keyof K, V>
    newReq.constant = constant
    return ctx.next(newReq, ctx.res)
  }
}

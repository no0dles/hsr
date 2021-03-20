import { HttpRequest } from './http-request'
import { HttpResponse } from './http-response'
import { HttpMiddleware } from './http-middleware'
import { HttpPlugin } from './http-plugin'
import { HttpHandler } from './http-handler'

export interface HttpRouter<TReq extends HttpRequest, TRes, TParams> {
  handle(request: HttpRequest, response: HttpResponse): Promise<HttpResponse>

  post(handler: HttpHandler<TReq, TRes, TParams>): void

  get(handler: HttpHandler<TReq, TRes, TParams>): void

  options(handler: HttpHandler<TReq, TRes, TParams>): void

  put(handler: HttpHandler<TReq, TRes, TParams>): void

  delete(handler: HttpHandler<TReq, TRes, TParams>): void

  path(path: string): HttpRouter<TReq, TRes, TParams>

  use<TNewReq extends HttpRequest, TNewRes>(
    middleware: HttpMiddleware<TReq, TRes, TNewReq, TNewRes>
  ): HttpRouter<TNewReq, TNewRes, TParams>

  plugin<TRouter>(plugin: HttpPlugin<TRouter>): TRouter & HttpRouter<TReq, TRes, TParams>

  param<K>(name: keyof K): HttpRouter<TReq & HttpRequest, TRes, TParams & Record<typeof name, string>>
}

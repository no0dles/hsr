import { HttpRouter } from './http-router'
import { HttpRequest } from './http-request'
import { HttpResponse } from './http-response'

export interface HttpPlugin<TRouter> {
  (router: HttpRouter<HttpRequest, HttpResponse, any>): TRouter
}

import { HttpMiddlewareContext } from './http-middleware-context'
import { HttpResponse } from './http-response'
import { HttpRequest } from './http-request'

export class HttpMiddlewareContextImpl implements HttpMiddlewareContext<HttpRequest, HttpRequest> {
  constructor(public req: HttpRequest, public next: (req: HttpRequest) => Promise<HttpResponse>) {}
}

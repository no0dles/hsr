import { HttpMiddlewareContext } from './http-middleware-context'
import { HttpResponse } from './http-response'
import { HttpRequest } from './http-request'

export class HttpMiddlewareContextImpl
  implements HttpMiddlewareContext<HttpRequest, HttpRequest, HttpResponse, HttpResponse> {
  constructor(
    public req: HttpRequest,
    public res: HttpResponse,
    public next: (req: HttpRequest, res: HttpResponse) => Promise<HttpResponse>
  ) {}
}

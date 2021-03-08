import { HttpResponse } from './http-response'
import { HttpRequest } from './http-request'

export interface HttpMiddlewareContext<TInputReq extends HttpRequest, TOutputReq extends HttpRequest> {
  req: TInputReq
  next: (req: TOutputReq) => Promise<HttpResponse>
}

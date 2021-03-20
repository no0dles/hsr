import { HttpMiddlewareContext } from './http-middleware-context'
import { HttpRequest } from './http-request'

export interface HttpMiddleware<TInputReq extends HttpRequest, TInputRes, TOutputReq extends HttpRequest, TOutputRes> {
  (ctx: HttpMiddlewareContext<TInputReq, TOutputReq, TInputRes, TOutputRes>): Promise<TOutputRes> | TOutputRes
}

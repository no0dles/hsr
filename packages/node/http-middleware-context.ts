import { HttpRequest } from './http-request'

export interface HttpMiddlewareContext<TInputReq extends HttpRequest, TOutputReq extends HttpRequest, TInputRes, TOutputRes> {
  req: TInputReq
  res: TInputRes
  next: (req: TOutputReq, res: TOutputRes) => Promise<TOutputRes>
}

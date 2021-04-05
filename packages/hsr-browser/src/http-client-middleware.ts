import { HttpClient } from './http-client'

export interface HttpClientMiddleware<TInputRes, TOutputRes> {
  handleResponse(res: TInputRes): Promise<TOutputRes> | TOutputRes

  handleRequest(res: HttpClient<any>): HttpClient<any>
}

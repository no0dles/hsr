import { HttpMethod } from '../client/http-method'
import { HttpMessage } from '../client/http-message'
import { HttpResponse } from './http-response'

export interface HttpRequest extends HttpMessage {
  method: HttpMethod
  url: string
  paths: string[]

  ok(body?: any): HttpResponse
  created(body?: any): HttpResponse
  accepted(body?: any): HttpResponse
  badRequest(body?: any): HttpResponse
  unauthorized(body?: any): HttpResponse
  forbidden(body?: any): HttpResponse
  notFound(body?: any): HttpResponse
}

import { HttpMethod } from '../browser/http-method'
import { HttpMessage } from '../browser/http-message'

export interface HttpRequest extends HttpMessage {
  method: HttpMethod
  url: string
  paths: string[]
}

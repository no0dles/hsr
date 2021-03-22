import { HttpMessage } from '../../hsr-browser/http-message'
import { HttpMethod } from '../../hsr-browser/http-method'

export interface HttpRequest extends HttpMessage {
  method: HttpMethod
  url: string
  paths: string[]

  query(name: string): string | null
}

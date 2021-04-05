import { HttpMethod } from '@no0dles/hsr-browser/http-method'
import { HttpMessage } from '@no0dles/hsr-browser/http-message'

export interface HttpRequest extends HttpMessage {
  method: HttpMethod
  url: string
  paths: string[]

  query(name: string): string | null
}

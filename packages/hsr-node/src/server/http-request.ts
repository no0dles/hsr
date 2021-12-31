import { HttpMethod } from '@no0dles/hsr-browser'
import { HttpMessage } from '@no0dles/hsr-browser'

export interface HttpRequest extends HttpMessage {
  method: HttpMethod
  url: string
  paths: string[]

  query(name: string): string | null
}

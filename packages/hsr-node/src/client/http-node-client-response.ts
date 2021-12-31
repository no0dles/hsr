import { IncomingMessage } from 'http'
import { HttpClientResponse } from '@no0dles/hsr-browser'

export interface HttpNodeClientResponse extends HttpClientResponse {
  message: IncomingMessage
}

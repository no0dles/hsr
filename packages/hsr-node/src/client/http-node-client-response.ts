import { IncomingMessage } from 'http'
import { HttpClientResponse } from '@no0dles/hsr-browser/http-client-response'

export interface HttpNodeClientResponse extends HttpClientResponse {
  message: IncomingMessage
}

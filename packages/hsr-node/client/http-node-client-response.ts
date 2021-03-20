import { IncomingMessage } from 'http'
import { HttpClientResponse } from '../../hsr-browser/http-client-response'

export interface HttpNodeClientResponse extends HttpClientResponse {
  message: IncomingMessage
}

import { HttpMessage } from './http-message'

export interface HttpClientResponse extends HttpMessage {
  statusCode: number
}

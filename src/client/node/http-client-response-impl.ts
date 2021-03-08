import { HttpClientResponse } from '../http-client-response'
import { IncomingMessage } from 'http'
import { HttpMessageImpl } from '../http-message-impl'

export class HttpClientResponseImpl extends HttpMessageImpl implements HttpClientResponse {
  readonly statusCode: number

  constructor(private message: IncomingMessage) {
    super(message.headers ?? {}, message)
    this.statusCode = message.statusCode ?? 0
  }
}

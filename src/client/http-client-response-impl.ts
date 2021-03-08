import { HttpClientResponse } from './http-client-response'
import { IncomingMessage } from 'http'
import { HttpMessageImpl } from './http-message-impl'
import { HttpResponse } from '../server/http-response'
import { Readable } from 'stream'

export class HttpClientResponseImpl extends HttpMessageImpl implements HttpClientResponse {
  readonly statusCode: number

  constructor(private message: IncomingMessage | HttpResponse) {
    super(message.headers ?? {}, message instanceof Readable ? message : message.body)
    this.statusCode = message.statusCode ?? 0
  }
}

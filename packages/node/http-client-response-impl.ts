import { HttpClientResponse } from '../browser/http-client-response'
import { IncomingMessage } from 'http'
import { readableToBuffer } from './http-request-impl'

export class HttpClientResponseImpl implements HttpClientResponse {
  readonly statusCode: number

  constructor(private message: IncomingMessage) {
    this.statusCode = message.statusCode ?? 0
  }

  async bodyAsString(): Promise<string> {
    const buffer = await readableToBuffer(this.message)
    return buffer.toString()
  }

  header(name: string): string | string[] | null {
    return this.message.headers[name.toLocaleLowerCase()] ?? null
  }

  headerAsString(name: string): string | null {
    const header = this.header(name)
    if (!header) {
      return null
    }
    if (typeof header === 'string') {
      return header
    }
    return header.join(', ')
  }

  async bodyAsJson<T = unknown>(): Promise<T> {
    const string = await this.bodyAsString()
    return JSON.parse(string)
  }
}

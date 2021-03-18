import { HttpClientResponse } from '../browser/http-client-response'
import { IncomingMessage } from 'http'
import { readableToBuffer } from './http-request-impl'

export interface HttpNodeClientResponse extends HttpClientResponse {
  message: IncomingMessage;
}

export class HttpClientResponseImpl implements HttpNodeClientResponse {
  readonly statusCode: number

  constructor(public message: IncomingMessage) {
    this.statusCode = message.statusCode ?? 0
  }

  hasHeaderValue(name: string, value: string): boolean {
    const headers = this.header(name)
    if (typeof headers === 'string') {
      return headers === value
    } else if (headers instanceof Array) {
      return headers.some(h => h === value)
    }
    return false
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

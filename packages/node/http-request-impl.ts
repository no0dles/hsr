import { IncomingMessage } from 'http'
import { Readable } from 'stream'
import { HttpRequest } from './http-request'
import { HttpMethod } from '../browser/http-method'
import { HttpResponse } from './http-response'

export function readableToBuffer(readable: Readable): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const body: (Buffer | string)[] = []
    readable
      .on('data', (chunk) => {
        body.push(chunk)
      })
      .on('end', () => {
        resolve(Buffer.concat(body.map((i) => (typeof i === 'string' ? Buffer.from(i) : i))))
      })
      .on('error', (err) => {
        reject(err)
      })
  })
}

export class HttpRequestImpl implements HttpRequest {
  method: HttpMethod
  url: string
  paths: string[]

  constructor(private message: IncomingMessage) {
    this.url = this.message.url ?? ''
    this.method = this.message.method as HttpMethod
    this.paths = this.url.split('/').filter((p) => !!p)
  }

  bodyAsBuffer(): Promise<Buffer> {
    return readableToBuffer(this.message)
  }

  async bodyAsString(): Promise<string> {
    const buffer = await this.bodyAsBuffer()
    return buffer.toString()
  }

  header(name: string): string | string[] | null {
    return this.message.headers[name] ?? null
  }

  headerAsString(name: string) {
    const header = this.message.headers[name]
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

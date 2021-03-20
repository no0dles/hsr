import { IncomingMessage } from 'http'
import { Readable } from 'stream'
import { HttpRequest } from './http-request'
import { HttpMethod } from '../../hsr-browser/http-method'

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
    const header = this.message.headers[name] ?? null
    if (!header) {
      return header
    }
    if (typeof header === 'string') {
      const headers = header.split(',').map((h) => h.trim())
      if (headers.length === 1) {
        return headers[0]
      }
      return headers
    }
    return header
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

  hasHeaderValue(name: string, value: string): boolean {
    const headers = this.header(name)
    if (typeof headers === 'string') {
      return headers === value
    } else if (headers instanceof Array) {
      return headers.some((h) => h === value)
    }
    return false
  }
}

import { IncomingMessage } from 'http'
import { Readable } from 'stream'
import { URLSearchParams } from 'url'
import { HttpRequest } from './http-request'
import { HttpMethod } from '@no0dles/hsr-browser'

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
  private readonly searchParams: URLSearchParams
  method: HttpMethod
  url: string
  paths: string[]

  constructor(private message: IncomingMessage) {
    this.url = this.message.url ?? ''
    this.method = this.message.method as HttpMethod

    const queryIndex = this.url.indexOf('?')
    if (queryIndex >= 0) {
      this.searchParams = new URLSearchParams(this.url.substr(queryIndex))
      this.paths = this.url
        .substr(0, queryIndex)
        .split('/')
        .filter((p) => !!p)
    } else {
      this.searchParams = new URLSearchParams()
      this.paths = this.url.split('/').filter((p) => !!p)
    }
  }

  query(name: string): string | null {
    return this.searchParams.get(name)
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

  headers() {
    const result: { [key: string]: string | string[] } = {};
    for (const key of Object.keys(this.message.headers)) {
      const value = this.message.headers[key];
      if (value) {
        result[key] = value;
      }
    }
    return result;
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

import { IncomingMessage } from 'http'
import { Readable } from 'stream'
import { HttpRequest } from './http-request'
import { HttpMethod } from '../client/http-method'
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

  async bodyAsString(encoding?: BufferEncoding): Promise<string> {
    const buffer = await this.bodyAsBuffer()
    return buffer.toString(encoding)
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

  private response(statusCode: number, body?: any): HttpResponse {
    if (!body) {
      return {
        statusCode,
      }
    }

    if (typeof body === 'string' || body instanceof Buffer || body instanceof Readable) {
      return {
        statusCode,
        body,
      }
    }

    return {
      statusCode,
      body: JSON.stringify(body),
    }
  }

  accepted(body?: any): HttpResponse {
    return this.response(202, body)
  }

  badRequest(body?: any): HttpResponse {
    return this.response(400, body)
  }

  created(body?: any): HttpResponse {
    return this.response(201, body)
  }

  forbidden(body?: any): HttpResponse {
    return this.response(403, body)
  }

  notFound(body?: any): HttpResponse {
    return this.response(404, body)
  }

  ok(body?: any): HttpResponse {
    return this.response(200, body)
  }

  unauthorized(body?: any): HttpResponse {
    return this.response(401, body)
  }
}

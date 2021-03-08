import { HttpMessage } from './http-message'
import { Readable } from 'stream'
import { readableToBuffer } from '../server/http-request-impl'

export class HttpMessageImpl implements HttpMessage {
  private readonly bodyStream: Readable
  private readonly bodyBuffer: Promise<Buffer>
  private readonly bodyString: Promise<string>
  private readonly headers: { [key: string]: string | string[] }

  constructor(headers: { [key: string]: string | string[] | undefined }, body: Readable | Buffer | string | undefined) {
    if (typeof body === 'string') {
      this.bodyString = Promise.resolve(body)
      this.bodyBuffer = Promise.resolve(Buffer.from(body))
      this.bodyStream = Readable.from([body])
    } else if (body instanceof Buffer) {
      this.bodyBuffer = Promise.resolve(body)
      this.bodyString = Promise.resolve(body.toString())
      this.bodyStream = Readable.from([body.toString()])
    } else if (body instanceof Readable) {
      this.bodyStream = body
      this.bodyBuffer = readableToBuffer(body)
      this.bodyString = readableToBuffer(body).then((buffer) => buffer.toString())
    } else {
      this.bodyStream = Readable.from([])
      this.bodyBuffer = Promise.resolve(Buffer.from(''))
      this.bodyString = Promise.resolve('')
    }
    this.headers = Object.keys(headers).reduce<{ [key: string]: string | string[] }>((map, key) => {
      const value = headers[key]
      if (value) {
        map[key.toLocaleLowerCase()] = value
      }
      return map
    }, {})
  }

  bodyAsBuffer(): Promise<Buffer> {
    return Promise.resolve(this.bodyBuffer)
  }

  bodyAsStream(): Readable {
    return this.bodyStream
  }

  bodyAsString(encoding?: BufferEncoding): Promise<string> {
    return Promise.resolve(this.bodyString)
  }

  header(name: string): string | string[] | null {
    return this.headers[name.toLocaleLowerCase()] ?? null
  }

  headerAsString(name: string) {
    const header = this.headers[name]
    if (!header) {
      return null
    }
    if (typeof header === 'string') {
      return header
    }
    return header.join(', ')
  }
}

import { HttpResponse } from './http-response'
import { Readable } from 'stream'

export class HttpResponseImpl implements HttpResponse {
  private readonly headerMap: { [key: string]: string | string[] } = {}
  private bodyValue: string | Buffer | Readable | null = null
  private statusCodeValue = 200

  body(value: string | Buffer | Readable): this
  body(): string | Buffer | Readable | null
  body(value?: string | Buffer | Readable): this | string | null | Buffer | Readable {
    if (arguments.length === 1) {
      if (value !== undefined) {
        this.bodyValue = value
      }
      return this
    } else {
      return this.bodyValue
    }
  }

  header(key: string, value: string | string[]): this
  header(key: string): string | string[]
  header(key: string, value?: string | string[]): this | string | string[] {
    if (arguments.length === 2) {
      if (value) {
        this.headerMap[key] = value
      }
      return this
    } else {
      return this.headerMap[key]
    }
  }

  headers(): { [p: string]: string | string[] } {
    return this.headerMap
  }

  json(value: any, pretty?: boolean): this {
    if (pretty) {
      this.bodyValue = JSON.stringify(value, null, 2)
    } else {
      this.bodyValue = JSON.stringify(value)
    }
    return this
  }

  statusCode(number: number): this
  statusCode(): number
  statusCode(number?: number): this | number {
    if (number === undefined) {
      return this.statusCodeValue
    } else {
      this.statusCodeValue = number
      return this
    }
  }

  hasHeader(key: string): boolean {
    return !!this.headerMap[key]
  }
}

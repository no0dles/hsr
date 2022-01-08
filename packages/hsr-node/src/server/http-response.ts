import { Readable } from 'stream'

export interface HttpResponse {
  statusCode(number: number): this

  statusCode(): number

  header(key: string, value: string | string[]): this
  removeHeader(key: string): this;

  header(key: string): string | string[]
  hasHeader(key: string): boolean

  headers(): { [key: string]: string | string[] }

  body(value: string | Buffer | Readable | null): this
  body(): string | Buffer | Readable | null

  json(value: any, pretty?: boolean): this
}

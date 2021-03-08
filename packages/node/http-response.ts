import { Readable } from 'stream'

export interface HttpResponse {
  statusCode: number
  headers?: { [key: string]: string | string[] }
  body?: string | Buffer | Readable
}

//import { Readable } from 'stream'

export interface HttpMessage {
  //bodyAsStream(): Readable

  bodyAsBuffer(): Promise<Buffer>

  bodyAsString(): Promise<string>

  header(name: string): string | string[] | null
  headerAsString(name: string): string | null
}

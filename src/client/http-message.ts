export interface HttpMessage {
  bodyAsBuffer(): Promise<Buffer>

  bodyAsString(): Promise<string>

  header(name: string): string | string[] | null
  headerAsString(name: string): string | null
}

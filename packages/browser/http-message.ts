export interface HttpMessage {
  bodyAsString(): Promise<string>

  header(name: string): string | string[] | null
  headerAsString(name: string): string | null
}

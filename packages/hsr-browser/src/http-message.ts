export interface HttpMessage {
  bodyAsString(): Promise<string>
  bodyAsJson<T = unknown>(): Promise<T>

  headers(): { [key: string]: string | string[] }
  header(name: string): string | string[] | null
  hasHeaderValue(name: string, value: string): boolean
  headerAsString(name: string): string | null
}

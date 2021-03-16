export interface HttpMessage {
  bodyAsString(): Promise<string>
  bodyAsJson<T = unknown>(): Promise<T>;

  header(name: string): string | string[] | null
  headerAsString(name: string): string | null
}

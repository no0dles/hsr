import { HttpClientMiddleware } from './http-client-middleware'

export interface HttpClient<TResponse> {
  path(path: string): this

  use<TNewResponse>(middleware: HttpClientMiddleware<TResponse, TNewResponse>): this & HttpClient<TNewResponse>

  header(name: string, value: string | string[]): this

  query(name: string, value: string | string[]): this

  body(body: string): HttpClient<TResponse>

  options(path?: string): Promise<TResponse>

  get(path?: string): Promise<TResponse>

  head(path?: string): Promise<TResponse>

  post(path?: string): Promise<TResponse>

  put(path?: string): Promise<TResponse>

  patch(path?: string): Promise<TResponse>

  delete(path?: string): Promise<TResponse>

  close(): Promise<void>
}

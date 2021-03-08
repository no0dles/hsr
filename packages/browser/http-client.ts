import { HttpClientPlugin } from './http-client-plugin'

export interface HttpClient<TResponse> {
  path(path: string): this

  header(name: string, value: string | string[]): this

  body(body: string): HttpClient<TResponse>

  options(path?: string): Promise<TResponse>

  get(path?: string): Promise<TResponse>

  head(path?: string): Promise<TResponse>

  post(path?: string): Promise<TResponse>

  put(path?: string): Promise<TResponse>

  patch(path?: string): Promise<TResponse>

  delete(path?: string): Promise<TResponse>

  plugin<C, R>(plugin: HttpClientPlugin<C, R>): HttpClient<R & TResponse> & C
}

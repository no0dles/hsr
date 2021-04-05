import { HttpClientMiddleware } from './http-client-middleware'

export interface HttpClientConfig {
  baseUrl: string
  paths: string[]
  body: string | null
  query: { [key: string]: string | string[] }
  headers: { [key: string]: string | string[] }
  middlewares: HttpClientMiddleware<any, any>[]
}

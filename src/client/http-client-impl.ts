import { HttpClient } from './http-client'
import { HttpMethod } from './http-method'
import { HttpClientResponse } from './http-client-response'
import { HttpClientPlugin } from './http-client-plugin'
import { HttpAdapter } from './http-adapter'

export interface HttpClientConfig {
  baseUrl: string
  paths: string[]
  body: string | Buffer | null
  query: { [key: string]: string | string[] }
  headers: { [key: string]: string | string[] }
}

export class HttpClientImpl implements HttpClient<any> {
  constructor(private adapter: HttpAdapter, private config: HttpClientConfig) {}

  close(): Promise<void> {
    return Promise.resolve()
  }

  delete(path?: string): Promise<HttpClientResponse> {
    return this.processPath('DELETE', path)
  }

  get(path?: string): Promise<HttpClientResponse> {
    return this.processPath('GET', path)
  }

  head(path?: string): Promise<HttpClientResponse> {
    return this.processPath('HEAD', path)
  }

  options(path?: string): Promise<HttpClientResponse> {
    return this.processPath('OPTIONS', path)
  }

  post(path?: string): Promise<HttpClientResponse> {
    return this.processPath('POST', path)
  }

  put(path?: string): Promise<HttpClientResponse> {
    return this.processPath('PUT', path)
  }

  patch(path?: string): Promise<any> {
    return this.processPath('PATCH', path)
  }

  private processPath(method: HttpMethod, path?: string) {
    if (path) {
      return this.path(path).process(method)
    } else {
      return this.process(method)
    }
  }

  private process(method: HttpMethod) {
    return this.adapter.send(this.config, method)
  }

  body(body: string | Buffer): this {
    const newReq = Object.create(this) as HttpClientImpl
    newReq.config = Object.create(newReq.config)
    newReq.config.body = body
    return newReq as this
  }

  header(name: string, value: string | string[]): this {
    const newReq = Object.create(this) as HttpClientImpl
    newReq.config = Object.create(newReq.config)
    newReq.config.headers = { ...newReq.config.headers }
    newReq.config.headers[name] = value
    return newReq as this
  }

  path(path: string): this {
    const newReq = Object.create(this) as HttpClientImpl
    newReq.config = Object.create(newReq.config)
    newReq.config.paths = [...newReq.config.paths, path]
    return newReq as this
  }

  plugin<C, R>(plugin: HttpClientPlugin<C, R>): HttpClient<any> & C {
    const newReq = Object.create(this) as HttpClient<R>
    return plugin.extendClient(newReq) as any
  }
}

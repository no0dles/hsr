import { HttpClient } from '../../hsr-browser/http-client'
import { Server } from 'http'
import { HttpClientImpl } from '../../hsr-browser/http-client-impl'
import { NodeHttpAdapter } from '../client/http-node-adapter'
import { HttpClientMiddleware } from '../../hsr-browser/http-client-middleware'
import { HttpNodeClientResponse } from '../client/http-node-client-response'

export interface HttpRouterConfig {
  query: { [key: string]: string | string[] }
  paths: string[]
  headers: { [key: string]: string | string[] }
  body: string | null
  server: Promise<Server>
  middlewares: HttpClientMiddleware<any, any>[]
}

export class HttpRouterClientImpl implements HttpClient<HttpNodeClientResponse> {
  constructor(private config: HttpRouterConfig) {}

  private async request(): Promise<HttpClient<any>> {
    const server = await this.config.server
    const address = server.address()
    const baseUrl = typeof address === 'string' ? address : `http://localhost:${address?.port}`
    return new HttpClientImpl(new NodeHttpAdapter(), {
      baseUrl,
      query: this.config.query,
      paths: this.config.paths,
      body: this.config.body,
      headers: this.config.headers,
      middlewares: this.config.middlewares,
    })
  }

  async delete(path?: string): Promise<HttpNodeClientResponse> {
    const client = await this.request()
    return client.delete(path)
  }

  async head(path?: string): Promise<HttpNodeClientResponse> {
    const client = await this.request()
    return client.head(path)
  }

  async get(path?: string): Promise<HttpNodeClientResponse> {
    const client = await this.request()
    return client.get(path)
  }

  async options(path?: string): Promise<HttpNodeClientResponse> {
    const client = await this.request()
    return client.options(path)
  }

  async post(path?: string): Promise<HttpNodeClientResponse> {
    const client = await this.request()
    return client.post(path)
  }

  async put(path?: string): Promise<HttpNodeClientResponse> {
    const client = await this.request()
    return client.put(path)
  }

  async patch(path?: string): Promise<any> {
    const client = await this.request()
    return client.patch(path)
  }

  async close(): Promise<void> {
    const server = await this.config.server
    const addr = server.address()
    if (!addr) {
      return
    }

    return new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  use<TNewResponse>(middleware: HttpClientMiddleware<any, TNewResponse>): this & HttpClient<TNewResponse> {
    const newReq = Object.create(this) as HttpRouterClientImpl
    newReq.config = Object.create(newReq.config)
    newReq.config.middlewares = [...newReq.config.middlewares, middleware]
    return newReq as any
  }

  body(body: string): HttpClient<any> {
    const newReq = Object.create(this) as HttpRouterClientImpl
    newReq.config = Object.create(newReq.config)
    newReq.config.body = body
    return newReq as this
  }

  header(name: string, value: string | string[]): this {
    const newReq = Object.create(this) as HttpRouterClientImpl
    newReq.config = Object.create(newReq.config)
    newReq.config.headers = { ...newReq.config.headers }
    newReq.config.headers[name] = value
    return newReq as this
  }

  path(path: string): this {
    const newReq = Object.create(this) as HttpRouterClientImpl
    newReq.config = Object.create(newReq.config)
    newReq.config.paths = [...newReq.config.paths, path]
    return newReq as this
  }

  query(name: string, value: string | string[]): this {
    const newReq = Object.create(this) as HttpRouterClientImpl
    newReq.config = Object.create(newReq.config)
    newReq.config.query = { ...newReq.config.query }
    newReq.config.query[name] = value
    return newReq as this
  }
}

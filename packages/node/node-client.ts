import { HttpRouter } from './http-router'
import { HttpClient } from '../browser/http-client'
import { HttpClientImpl } from '../browser/http-client-impl'
import { HttpRouterClientImpl } from './http-router-client-impl'
import { HttpClientResponse } from '../browser/http-client-response'
import { getServer } from './server'
import { NodeHttpAdapter } from './http-node-adapter'

export function nodeClient(baseUrl: string): HttpClient<HttpClientResponse>
export function nodeClient(router: HttpRouter<any, any, any>): HttpClient<HttpClientResponse>
export function nodeClient(baseUrlOrRouter: string | HttpRouter<any, any, any>): HttpClient<HttpClientResponse> {
  if (typeof baseUrlOrRouter === 'string') {
    return new HttpClientImpl(new NodeHttpAdapter(), {
      baseUrl: baseUrlOrRouter,
      query: {},
      body: null,
      headers: {},
      paths: [],
    })
  } else {
    return new HttpRouterClientImpl({
      query: {},
      paths: [],
      body: null,
      headers: {},
      server: getServer(baseUrlOrRouter),
    })
  }
}

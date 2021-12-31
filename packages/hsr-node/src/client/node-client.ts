import { HttpRouter } from '../server/http-router'
import { HttpClient } from '@no0dles/hsr-browser'
import { HttpClientImpl } from '@no0dles/hsr-browser'
import { HttpRouterClientImpl } from '../server/http-router-client-impl'
import { NodeHttpAdapter } from './http-node-adapter'
import { HttpNodeClientResponse } from './http-node-client-response'
import { listenHttp } from '../server/server'

export function nodeClient(baseUrl: string): HttpClient<HttpNodeClientResponse>
export function nodeClient(router: HttpRouter<any, any, any>): HttpClient<HttpNodeClientResponse>
export function nodeClient(baseUrlOrRouter: string | HttpRouter<any, any, any>): HttpClient<HttpNodeClientResponse> {
  if (typeof baseUrlOrRouter === 'string') {
    return new HttpClientImpl(new NodeHttpAdapter(), {
      baseUrl: baseUrlOrRouter,
      query: {},
      body: null,
      headers: {},
      paths: [],
      middlewares: [],
    })
  } else {
    return new HttpRouterClientImpl({
      query: {},
      paths: [],
      body: null,
      headers: {},
      middlewares: [],
      server: listenHttp(baseUrlOrRouter),
    })
  }
}

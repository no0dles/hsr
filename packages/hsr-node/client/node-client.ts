import { HttpRouter } from '../server/http-router'
import { HttpClient } from '../../hsr-browser/http-client'
import { HttpClientImpl } from '../../hsr-browser/http-client-impl'
import { HttpRouterClientImpl } from '../server/http-router-client-impl'
import { getServer } from '../server/server'
import { NodeHttpAdapter } from './http-node-adapter'
import { HttpNodeClientResponse } from './http-node-client-response'

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
      server: getServer(baseUrlOrRouter),
    })
  }
}
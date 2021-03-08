import { HttpRouter } from '../../server/http-router'
import { HttpClient } from '../http-client'
import { HttpClientImpl } from '../http-client-impl'
import { HttpRouterClientImpl } from '../http-router-client-impl'
import { HttpClientResponse } from '../http-client-response'
import { getServer } from '../../server/server'
import { NodeHttpAdapter } from './http-node-adapter'

export function client(baseUrl: string): HttpClient<HttpClientResponse>
export function client(router: HttpRouter<any, any, any>): HttpClient<HttpClientResponse>
export function client(baseUrlOrRouter: string | HttpRouter<any, any, any>): HttpClient<HttpClientResponse> {
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

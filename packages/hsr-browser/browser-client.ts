import { HttpClient } from './http-client'
import { HttpClientResponse } from './http-client-response'
import { HttpClientImpl } from './http-client-impl'
import { BrowserHttpAdapter } from './http-browser-adapter'

export function browserClient(baseUrl?: string): HttpClient<HttpClientResponse> {
  return new HttpClientImpl(new BrowserHttpAdapter(), {
    baseUrl: baseUrl ?? '',
    query: {},
    body: null,
    headers: {},
    paths: [],
    middlewares: [],
  })
}

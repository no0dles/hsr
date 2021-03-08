import { HttpClient } from './http-client'
import { HttpClientResponse } from './http-client-response'

export interface HttpClientPlugin<TClient, TResponse> {
  extendClient(req: HttpClient<TResponse>): TClient
  extendResponse(res: HttpClientResponse): TResponse
}

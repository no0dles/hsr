import { HttpMethod } from './http-method'
import { HttpClientResponse } from './http-client-response'
import { HttpClientConfig } from './http-client-config'

export interface HttpAdapter<TResponse extends HttpClientResponse> {
  send(config: HttpClientConfig, method: HttpMethod): Promise<TResponse>
}

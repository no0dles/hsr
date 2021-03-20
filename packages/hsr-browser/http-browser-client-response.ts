import { HttpClientResponse } from './http-client-response'

export interface HttpBrowserClientResponse extends HttpClientResponse {
  bodyAsBlob(): Promise<Blob>
}

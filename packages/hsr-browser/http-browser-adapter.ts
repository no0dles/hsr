import { HttpMethod } from './http-method'
import { HttpAdapter } from './http-adapter'
import { HttpClientConfig } from './http-client-config'
import { HttpBrowserClientResponse } from './http-browser-client-response'

export class BrowserHttpAdapter implements HttpAdapter<HttpBrowserClientResponse> {
  async send(config: HttpClientConfig, method: HttpMethod): Promise<HttpBrowserClientResponse> {
    const headers = new Headers()
    for (const key of Object.keys(config.headers)) {
      const values = config.headers[key]
      if (typeof values === 'string') {
        headers.set(key, values)
      } else {
        for (const value of values) {
          headers.append(key, value)
        }
      }
    }
    const res = await fetch(
      new URL(config.paths.join('/'), !config.baseUrl ? window.location.href : config.baseUrl).toString(),
      {
        method,
        headers,
        body: config.body,
      }
    )
    return {
      statusCode: res.status,
      bodyAsBlob(): Promise<Blob> {
        return res.blob()
      },
      header(name: string): string | string[] | null {
        const headers = res.headers
          .get(name)
          ?.split(',')
          .map((h) => h.trim())
        if (!headers) {
          return null
        }
        if (headers.length === 1) {
          return headers[0]
        }
        return headers
      },
      hasHeaderValue(name: string, value: string): boolean {
        const headers = res.headers
          .get(name)
          ?.split(',')
          .map((h) => h.trim())
        if (!headers) {
          return false
        }
        return headers.some((h) => h === value)
      },
      headerAsString(name: string): string | null {
        return res.headers.get(name)
      },
      bodyAsString(): Promise<string> {
        return res.text()
      },
      bodyAsJson<T = unknown>(): Promise<T> {
        return res.json()
      },
    }
  }
}

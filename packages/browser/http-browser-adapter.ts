import { HttpMethod } from './http-method'
import { HttpClientResponse } from './http-client-response'
import { HttpClientConfig } from './http-client-impl'
import { HttpAdapter } from './http-adapter'

export class BrowserHttpAdapter implements HttpAdapter {
  async send(config: HttpClientConfig, method: HttpMethod): Promise<HttpClientResponse> {
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
    const res = await fetch(new URL(config.paths.join('/'), !config.baseUrl ? window.location.href : config.baseUrl).toString(), {
      method,
      headers,
      body: config.body,
    })
    return {
      statusCode: res.status,
      header(name: string): string | string[] | null {
        return res.headers.get(name)
      },
      headerAsString(name: string): string | null {
        return res.headers.get(name)
      },
      bodyAsString(): Promise<string> {
        return res.text()
      },
      bodyAsJson<T = unknown>(): Promise<T> {
        return res.json()
      }
    }
  }
}

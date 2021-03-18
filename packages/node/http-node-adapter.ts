import { HttpMethod } from '../browser/http-method'
import { HttpClientResponse } from '../browser/http-client-response'
import { request as httpRequest } from 'http'
import { request as httpsRequest } from 'https'
import { HttpClientResponseImpl, HttpNodeClientResponse } from './http-client-response-impl'
import { Readable } from 'stream'
import { readableToBuffer } from './http-request-impl'
import { URL } from 'url'
import { stringify } from 'querystring'
import { HttpClientConfig } from '../browser/http-client-impl'
import { HttpAdapter } from '../browser/http-adapter'

export class NodeHttpAdapter implements HttpAdapter<HttpNodeClientResponse> {
  send(config: HttpClientConfig, method: HttpMethod): Promise<HttpNodeClientResponse> {
    let _request: typeof httpRequest
    if (config.baseUrl.startsWith('https:')) {
      _request = httpsRequest
    } else if (config.baseUrl.startsWith('http')) {
      _request = httpRequest
    } else {
      throw new Error(`unknown base url ${config.baseUrl}`)
    }

    const url = this.getUrl(config)
    return new Promise<HttpNodeClientResponse>(async (resolve, reject) => {
      try {
        const req = _request(
          url,
          {
            method,
            headers: config.headers,
          },
          async (res) => {
            let currentRes = new HttpClientResponseImpl(res)
            for (const middleware of config.middlewares) {
              currentRes = await middleware.handleResponse(currentRes)
            }
            resolve(currentRes)
          },
        )
        if (config.body) {
          req.write(config.body)
        }
        req.end()
      } catch (e) {
        reject(e)
      }
    })
  }

  private getUrl(config: HttpClientConfig): URL {
    const path = config.paths.join('/')
    if (!config.query) {
      return new URL(path, config.baseUrl)
    }

    return new URL(`${path}?${stringify(config.query)}`, config.baseUrl)
  }
}

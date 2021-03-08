import { HttpMethod } from '../http-method'
import { HttpClientResponse } from '../http-client-response'
import { request as httpRequest } from 'http'
import { request as httpsRequest } from 'https'
import { HttpClientResponseImpl } from './http-client-response-impl'
import { Readable } from 'stream'
import { readableToBuffer } from '../../server/http-request-impl'
import { URL } from 'url'
import { stringify } from 'querystring'
import { HttpClientConfig } from '../http-client-impl'
import { HttpAdapter } from '../http-adapter'

export class NodeHttpAdapter implements HttpAdapter {
  send(config: HttpClientConfig, method: HttpMethod): Promise<HttpClientResponse> {
    let _request: typeof httpRequest
    if (config.baseUrl.startsWith('https:')) {
      _request = httpsRequest
    } else if (config.baseUrl.startsWith('http')) {
      _request = httpRequest
    } else {
      throw new Error(`unknown base url ${config.baseUrl}`)
    }

    const url = this.getUrl(config)
    return new Promise<HttpClientResponse>(async (resolve, reject) => {
      try {
        const req = _request(
          url,
          {
            method,
            headers: config.headers,
          },
          (res) => {
            resolve(new HttpClientResponseImpl(res))
          }
        )
        if (config.body) {
          if (config.body instanceof Readable) {
            req.write(await readableToBuffer(config.body))
          } else {
            req.write(config.body)
          }
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

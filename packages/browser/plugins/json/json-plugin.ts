import { JsonHttpPlugin } from './json-http-plugin'
import { JsonHttpResponse } from './json-http-response'
import { JsonClient } from './json-client'
import { HttpClient } from '../../http-client'
import { HttpClientResponse } from '../../http-client-response'

export function jsonPlugin(): JsonHttpPlugin {
  return {
    extendClient(req: HttpClient<JsonHttpResponse>): JsonClient {
      const newClient = req as any
      newClient.json = function (data: any) {
        return this.body(JSON.stringify(data))
      }
      return newClient
    },
    extendResponse(res: HttpClientResponse): JsonHttpResponse {
      const newRes = res as any
      newRes.bodyAsJson = async () => {
        return JSON.parse(await res.bodyAsString())
      }
      return newRes
    },
  }
}

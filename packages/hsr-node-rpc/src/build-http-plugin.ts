import { RpcServer } from './rpc-server'
import { HttpPlugin } from '@no0dles/hsr-node/server/http-plugin'
import { HttpResponse } from '@no0dles/hsr-node/server/http-response'

export interface HttpRpcOptions {
  errorHandler: HttpRpcErrorHandler
}

export type HttpRpcErrorHandler = (error: Error, res: HttpResponse) => HttpResponse

export function buildHttpPlugin(rpcServer: RpcServer<any, any>, options?: Partial<HttpRpcOptions>): HttpPlugin<any> {
  const errorHandler: HttpRpcErrorHandler = options?.errorHandler ?? ((e, res) => res.statusCode(500))
  return (router) => {
    for (const key of Object.keys(rpcServer._calls)) {
      router.path(`/api/rpc/${key}`).post(async (req, res) => {
        const data = await req.bodyAsJson()
        try {
          const result = await rpcServer.execute(key, data)
          return res.statusCode(200).json(result)
        } catch (e) {
          try {
            return errorHandler(e, res)
          } catch (e) {
            return res.statusCode(500)
          }
        }
      })
    }
  }
}

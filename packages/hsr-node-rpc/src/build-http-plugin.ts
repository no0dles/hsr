import { HttpPlugin } from '@no0dles/hsr-node'
import { HttpResponse } from '@no0dles/hsr-node'
import { RpcServer } from './server'
import { ValidationError } from '@no0dles/hsr-browser-rpc'
import {HttpRequest} from '@no0dles/hsr-node/dist/esm';

export interface HttpRpcOptions {
  errorHandler: HttpRpcErrorHandler
}

export type HttpRpcErrorHandler = (error: unknown, res: HttpResponse, req: HttpRequest) => HttpResponse

export function buildHttpPlugin(rpcServer: RpcServer<any>, options?: Partial<HttpRpcOptions>): HttpPlugin<any> {
  const errorHandler: HttpRpcErrorHandler = options?.errorHandler ?? ((e, res) => res.statusCode(500))
  return (router) => {
    for (const key of rpcServer.handles) {
      router.path(`/api/rpc/${key}`).post(async (req, res) => {
        const data = await req.bodyAsJson()
        try {
          const result = await rpcServer.execute(key, data)
          if (result === undefined) {
            return res.statusCode(204);
          }
          return res.statusCode(200).json(result)
        } catch (e) {
          if (e instanceof ValidationError) {
            return res.statusCode(400).json({errors: e.validations})
          }

          try {
            return errorHandler(e, res, req)
          } catch (e) {
            return res.statusCode(500)
          }
        }
      })
    }
  }
}

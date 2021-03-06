import { RpcServer } from './rpc-server'
import { HttpPlugin } from '@no0dles/hsr-node/server/http-plugin'

export function buildHttpPlugin(rpcServer: RpcServer<any, any>): HttpPlugin<any> {
  return (router) => {
    for (const key of Object.keys(rpcServer._calls)) {
      router.path(`/api/rpc/${key}`).post(async (req, res) => {
        const data = await req.bodyAsJson()
        try {
          const result = await rpcServer.execute(key, data)
          return res.statusCode(200).json(result)
        } catch (e) {
          console.error(e)
          return res.statusCode(500)
        }
      })
    }
  }
}

import { RpcClient, RpcServer } from '../../browser/rpc/rpc-client'
import { nodeClient } from '../node-client'

export function rpcNodeClient<T extends RpcServer<any, any>>(url: string): RpcClient<T> {
  const client = nodeClient(url)
  return {
    async call<TCall extends T['_calls'], A extends T['_decorders'], P extends string & keyof TCall>(name: P, arg: A): Promise<T['_calls'][P]> {
      const result = await client.body(JSON.stringify(arg)).post(`/api/rpc/${name}`)
      return result.bodyAsJson()
    },
  }
}

import { nodeClient } from '@no0dles/hsr-node/client/node-client'
import { RpcServerInterface } from '@no0dles/hsr-browser-rpc/rpc-server-interface'
import { RpcClient } from '@no0dles/hsr-browser-rpc/rpc-client'

export function rpcNodeClient<T extends RpcServerInterface<any, any>>(url: string): RpcClient<T> {
  const client = nodeClient(url)
  return {
    async call<TCall extends T['_calls'], A extends T['_decorders'], P extends string & keyof TCall>(
      name: P,
      arg: A
    ): Promise<T['_calls'][P]> {
      const result = await client.body(JSON.stringify(arg)).post(`/api/rpc/${name}`)
      return result.bodyAsJson()
    },
  }
}

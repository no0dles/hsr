import { RpcServerInterface } from './rpc-server-interface'
import { RpcClient } from './rpc-client'
import { browserClient } from '@no0dles/hsr-browser/browser-client'

export function rpcBrowserClient<T extends RpcServerInterface<any, any>>(url?: string): RpcClient<T> {
  const client = browserClient(url)
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

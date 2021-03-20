import type { Type } from 'io-ts'
import { browserClient } from '../hsr-browser/browser-client'

export interface RpcServer<T, D> {
  _calls: Readonly<T>
  _decorders: Readonly<D>

  cmd<C, R, I>(
    path: keyof C,
    decoder: Type<I>,
    handler: (req: I) => R
  ): RpcServer<T & Record<typeof path, R>, D & Record<typeof path, I>>

  execute<P extends string & keyof T & keyof D>(name: P, arg: D[P]): Promise<T[P]>
}

export interface RpcClient<V extends RpcServer<any, any>> {
  call<TCall extends V['_calls'], A extends V['_decorders'], P extends string & keyof TCall>(
    name: P,
    arg: A[P]
  ): Promise<V['_calls'][P]>
}

export function rpcBrowserClient<T extends RpcServer<any, any>>(url?: string): RpcClient<T> {
  const client = browserClient()
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

import type { Type } from 'io-ts'

export interface RpcServer<T, D> {
  _calls: Readonly<T>
  _decorders: Readonly<D>

  cmd<C, R, I>(path: keyof C, decoder: Type<I>, handler: (req: I) => R): RpcServer<T & Record<typeof path, R>, D & Record<typeof path, I>>
  listen(port?: number): Promise<void>
}


export interface RpcClient<V extends RpcServer<any, any>> {
  call<TCall extends V['_calls'], A extends V['_decorders'], P extends string & keyof TCall>(name: P, arg: A[P]): Promise<V['_calls'][P]>;
}

export function rpcClient<T extends RpcServer<any, any>>(url: string): RpcClient<T> {
  return {
    async call<TCall extends T['_calls'], A extends T['_decorders'], P extends string & keyof TCall>(name: P, arg: A): Promise<T['_calls'][P]> {
      const result = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          name,
          arg,
        }),
      })
      return result.json()
    },
  }
}

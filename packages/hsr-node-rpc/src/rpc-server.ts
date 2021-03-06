import { RpcNodeServerImpl } from './rpc-node-server-impl'
import { Type } from 'io-ts'
import { RpcServerInterface } from '@no0dles/hsr-browser-rpc/rpc-server-interface'

export interface RpcServer<T, D> extends RpcServerInterface<T, D> {
  _calls: Readonly<T>
  _decorders: Readonly<D>

  cmd<C, R, I>(
    path: keyof C,
    decoder: Type<I>,
    handler: (req: I) => Promise<R> | R
  ): RpcServer<T & Record<typeof path, R>, D & Record<typeof path, I>>

  execute<P extends string & keyof T & keyof D>(name: P, arg: D[P]): Promise<T[P]>
}

export function rpcServer(): RpcServer<{}, {}> {
  return new RpcNodeServerImpl()
}

import { RpcServerInterface } from './rpc-server-interface'

export interface RpcClient<V extends RpcServerInterface<any, any>> {
  call<TCall extends V['_calls'], A extends V['_decorders'], P extends string & keyof TCall>(
    name: P,
    arg: A[P],
  ): Promise<V['_calls'][P]>
}


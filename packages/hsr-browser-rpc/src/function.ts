export interface RpcClientFunction<I, O> {
  call(arg: I): Promise<O>;
}

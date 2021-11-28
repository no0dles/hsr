export type RpcServerFunction<I, O> = (input: I) => Promise<O> | O;

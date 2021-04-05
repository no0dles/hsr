export interface RpcServerInterface<T, D> {
  _calls: Readonly<T>
  _decorders: Readonly<D>
}

import { Type } from 'io-ts'
import { PathReporter } from 'io-ts/PathReporter'
import { RpcServer } from './rpc-server'

export class RpcNodeServerImpl implements RpcServer<any, any> {
  _calls: { [key: string]: (req: any) => Promise<any> | any } = {}
  _decorders: { [key: string]: Type<any> } = {}

  cmd<C, R, I>(path: keyof C, decoder: Type<I>, handler: (req: I) => R): RpcServer<any, any> {
    this._calls[path.toString()] = handler
    this._decorders[path.toString()] = decoder
    return this
  }

  async execute<P extends string & keyof any>(name: P, arg: any): Promise<any> {
    const val = this._decorders[name].decode(arg)
    if (val._tag === 'Left') {
      console.log(PathReporter.report(val))
      throw new Error('invalid argument')
    } else {
      const result = await this._calls[name](val.right)
      return result
    }
  }
}

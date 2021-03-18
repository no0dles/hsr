import { RpcServer } from '../../browser/rpc/rpc-client'
import { Type } from 'io-ts'
import { router } from '../router'
import { PathReporter } from 'io-ts/PathReporter'
import { getServer } from '../server'
import { HttpPlugin } from '../http-plugin'

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

export function rpcServer(): RpcServer<{}, {}> {
  return new RpcNodeServerImpl()
}

export function getRpcHttpPlugin(rpcServer: RpcServer<any, any>): HttpPlugin<any> {
  return (router) => {
    for (const key of Object.keys(rpcServer._calls)) {
      router.path(`/api/rpc/${key}`).post(async (req, res) => {
        const data = await req.bodyAsJson()
        try {
          const result = await rpcServer.execute(key, data)
          return res.statusCode(200).json(result)
        } catch (e) {
          console.error(e)
          return res.statusCode(500)
        }
      })
    }
  }
}

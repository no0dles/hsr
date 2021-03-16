import { RpcServer } from '../../browser/rpc/rpc-client'
import { Type } from 'io-ts'
import { router } from '../router'
import { PathReporter } from 'io-ts/PathReporter'
import { getServer } from '../server'

export class RpcNodeServerImpl implements RpcServer<any, any> {
  _calls: { [key: string]: (req: any) => Promise<any> | any } = {}
  _decorders: { [key: string]: Type<any> } = {}

  cmd<C, R, I>(path: keyof C, decoder: Type<I>, handler: (req: I) => R): RpcServer<any, any> {
    this._calls[path.toString()] = handler
    this._decorders[path.toString()] = decoder
    return this
  }

  listen(port?: number): Promise<void> {
    const app = router()
    for (const key of Object.keys(this._calls)) {
      app.path(`/api/rpc/${key}`).post(async (req, res) => {
        const data = await req.bodyAsJson()
        const val = this._decorders[key].decode(data)
        if (val._tag === 'Left') {
          console.log(PathReporter.report(val))
          return res.statusCode(400).json({message: 'invalid request'})
        } else {
          try {
            const result = await this._calls[key](val.right)
            return res.statusCode(200).body(JSON.stringify(result))
          } catch (e) {
            console.error(e)
            return res.statusCode(500)
          }
        }
      })
    }
    const server = getServer(app)
    return new Promise<void>((resolve, reject) => {
      server.on('error', err => reject(err))
      server.listen(port, () => {
        resolve()
      })
    })
  }

}

export function rpcServer(): RpcServer<{}, {}> {
  return new RpcNodeServerImpl();
}

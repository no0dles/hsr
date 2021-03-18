import { string, type } from 'io-ts'
import { getRpcHttpPlugin, rpcServer } from '../rpc-server'
import { router } from '../../router'
import { staticPlugin } from '../../plugins/static/static'
import { join } from 'path'
import { typescriptPlugin } from '../../plugins/typescript/typescript'

const fooDecoder = type({
  value: string,
})
export const rpcApp = rpcServer()
  .cmd('foo', fooDecoder, req => {
    return {
      message: 'foo' + req.value,
    }
  })

export const httpApp = router()
httpApp.plugin(staticPlugin({
  rootDir: join(__dirname, 'static'),
}))
httpApp.plugin(typescriptPlugin({ recursive: true, exclude: ['node_modules'], rootDir: process.cwd() }))
httpApp.plugin(getRpcHttpPlugin(rpcApp))


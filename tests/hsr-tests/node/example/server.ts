import { string, type } from 'io-ts'
import { rpcServer } from '../../../../packages/hsr-node-rpc/rpc-server'
import { router } from '../../../../packages/hsr-node/server/router'
import { join } from 'path'
import { typescriptPlugin } from '../../../../packages/hsr-node-typescript/typescript-plugin'
import { buildHttpPlugin } from '../../../../packages/hsr-node-rpc/build-http-plugin'
import { staticPlugin } from '../../../../packages/hsr-node-static'

const fooDecoder = type({
  value: string,
})
export const rpcApp = rpcServer().cmd('foo', fooDecoder, (req) => {
  return {
    message: 'foo' + req.value,
  }
})

export const httpApp = router()
httpApp.plugin(
  staticPlugin({
    rootDir: join(__dirname, 'static'),
  })
)
httpApp.plugin(
  typescriptPlugin({
    rootDir: join(__dirname, '../../../..'),
    entryFiles: [join(__dirname, 'static/main.ts')],
  })
)
httpApp.plugin(buildHttpPlugin(rpcApp))

import { string, type } from 'io-ts'
import { join } from 'path'
import { rpcServer } from '@no0dles/hsr-node-rpc/rpc-server'
import { buildHttpPlugin } from '@no0dles/hsr-node-rpc/build-http-plugin'
import { router } from '@no0dles/hsr-node/server/router'
import { staticPlugin } from '@no0dles/hsr-node-static/index'
import { typescriptPlugin } from '@no0dles/hsr-node-typescript/typescript-plugin'

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
    rootDir: join(__dirname, '../../../../..'),
    entryFiles: [join(__dirname, 'static/main.ts')],
  })
)
httpApp.plugin(buildHttpPlugin(rpcApp))

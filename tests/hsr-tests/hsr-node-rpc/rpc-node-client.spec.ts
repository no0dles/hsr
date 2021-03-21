import { rpcServer } from '../../../packages/hsr-node-rpc/rpc-server'
import { type, string } from 'io-ts'
import { rpcNodeClient } from '../../../packages/hsr-node-rpc/rpc-node-client'
import { router } from '../../../packages/hsr-node/server/router'
import { buildHttpPlugin } from '../../../packages/hsr-node-rpc/build-http-plugin'
import { listenHttp } from '../../../packages/hsr-node/server/server'

describe('rpc', () => {
  it('should', async () => {
    const fooDecoder = type({
      value: string,
    })
    const rpcApp = rpcServer().cmd('foo', fooDecoder, (req) => {
      return {
        message: 'foo' + req.value,
      }
    })
    const app = router()
    app.plugin(buildHttpPlugin(rpcApp))
    const server = await listenHttp(app)

    const client = rpcNodeClient<typeof rpcApp>('http://localhost:' + (<any>server.address()).port)
    const res = await client.call('foo', {
      value: 'test',
    })
    expect(res.message).toEqual('footest')
    server.close()
  })
})

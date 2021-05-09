import { type, string } from 'io-ts'
import { buildHttpPlugin } from '@no0dles/hsr-node-rpc/build-http-plugin'
import { router } from '@no0dles/hsr-node/server/router'
import { rpcNodeClient } from '@no0dles/hsr-node-rpc/rpc-node-client'
import { rpcServer } from '@no0dles/hsr-node-rpc/rpc-server'
import { listenHttp } from '@no0dles/hsr-node/server/server'

describe('rpc', () => {
  it('should', async () => {
    const fooDecoder = type({
      value: string,
    })
    const rpcApp = rpcServer().cmd('foo', fooDecoder, async (req) => {
      return {
        message: 'foo' + req.value,
      }
    })
    const app = router()
    app.plugin(buildHttpPlugin(rpcApp))
    const server = await listenHttp(app)

    const client = rpcNodeClient<typeof rpcApp>('http://localhost:' + (<any>server.address()).port)
    const resPromise = client.call('foo', {
      value: 'test',
    })
    const res = await resPromise
    expect(res.message).toEqual('footest')
    server.close()
  })
})

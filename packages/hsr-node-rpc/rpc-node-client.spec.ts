import { getRpcHttpPlugin, rpcServer } from './rpc-server'
import { type, string } from 'io-ts'
import { rpcNodeClient } from './rpc-node-client'
import { router } from '../hsr-node/server/router'
import { getServer } from '../hsr-node/server/server'

describe('rpc', () => {
  it('should', async () => {
    const fooDecoder = type({
      value: string,
    })
    const server = rpcServer().cmd('foo', fooDecoder, (req) => {
      return {
        message: 'foo' + req.value,
      }
    })
    const app = router()
    app.plugin(getRpcHttpPlugin(server))
    const serv = await getServer(app).listen(3333)

    const client = rpcNodeClient<typeof server>('http://localhost:3333')
    const res = await client.call('foo', {
      value: 'test',
    })
    expect(res.message).toEqual('footest')
    serv.close()
  })
})

import { rpcServer } from './rpc-server'
import { type, string } from 'io-ts'
import { rpcNodeClient } from './rpc-node-client'

describe('rpc', () => {
  it('should', async () => {
    const fooDecoder = type({
      value: string,
    })
    const server = rpcServer().cmd('foo', fooDecoder, req => {
      return {
        message: 'foo' + req.value,
      }
    })
    await server.listen(3333)

    const client = rpcNodeClient<typeof server>('http://localhost:3333')
    const res = await client.call('foo', {
      value: 'test'
    })
    console.log(res)
  })
})

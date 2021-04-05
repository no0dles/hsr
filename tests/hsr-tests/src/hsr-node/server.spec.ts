import { nodeClient } from '@no0dles/hsr-node/client/node-client'
import { router } from '@no0dles/hsr-node/server/router'
import { listenHttp } from '@no0dles/hsr-node/server/server'

describe('server', () => {
  it('should run server', async () => {
    const app = router()
    app.path('api/todo').get(async (req, res) => {
      return res.statusCode(200).json({ message: 'hi' })
    })
    const server = await listenHttp(app)
    const url = 'http://localhost:' + (server.address() as any).port
    const cli = nodeClient(url)
    const res = await cli.path('api/todo').get()
    expect(res.statusCode).toEqual(200)
    expect(await res.bodyAsString()).toEqual(JSON.stringify({ message: 'hi' }))
    server.close()
  })
})

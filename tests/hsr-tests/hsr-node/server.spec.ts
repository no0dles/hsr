import { router } from '../../../packages/hsr-node/server/router'
import { getServer } from '../../../packages/hsr-node/server/server'
import { nodeClient } from '../../../packages/hsr-node/client/node-client'

describe('server', () => {
  it('should run server', async () => {
    const app = router()
    app.path('api/todo').get(async (req, res) => {
      return res.statusCode(200).json({ message: 'hi' })
    })
    const ser = getServer(app)
    const url = await new Promise<string>((resolve) => {
      ser.listen(0, () => {
        resolve('http://localhost:' + (ser.address() as any).port)
      })
    })
    const cli = nodeClient(url)
    const res = await cli.path('api/todo').get()
    expect(res.statusCode).toEqual(200)
    expect(await res.bodyAsString()).toEqual(JSON.stringify({ message: 'hi' }))
    ser.close()
  })
})

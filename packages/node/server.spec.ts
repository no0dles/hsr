import { router } from './router'
import { getServer } from './server'
import { nodeClient } from './node-client'

describe('server', () => {
  it('should run server', async () => {
    const app = router()
    app.path('api/todo').get(async (req, res) => {
      return res.statusCode(200).json({ message: 'hi' })
    })
    const ser = getServer(app)
    ser.listen(3000)
    const cli = nodeClient('http://localhost:3000')
    const res = await cli.path('api/todo').get()
    expect(res.statusCode).toEqual(200)
    expect(await res.bodyAsString()).toEqual(JSON.stringify({ message: 'hi' }))
  })
})

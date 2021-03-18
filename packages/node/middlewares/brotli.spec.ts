import { router } from '../router'
import { nodeClient } from '../node-client'
import { brotli, nodeBrotliClient } from './brotli'


describe('node/middlewares/brotli', () => {
  it('should not use brotli if client does not support it', async () => {
    const app = router()
    app.use(brotli()).get((req, res) => {
      return res.json({ message: 'foo bar bar' })
    })
    const cli = nodeClient(app)
    const res = await cli.get()
    expect(res.statusCode).toEqual(200)
    const body = await res.bodyAsJson()
    console.log(body)
    expect(body).toEqual({ message: 'foo bar bar' })
  })

  it('should use brotli if client supports it', async () => {
    const app = router()
    app.use(brotli()).get((req, res) => {
      return res.json({ message: 'foo bar bar' })
    })
    const cli = nodeClient(app).use(nodeBrotliClient())
    const res = await cli.get()
    expect(res.statusCode).toEqual(200)
    const body = await res.bodyAsJson()
    console.log(body)
    expect(body).toEqual({ message: 'foo bar bar' })
  })
})

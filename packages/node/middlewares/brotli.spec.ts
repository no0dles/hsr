import { router } from '../router'
import { nodeClient } from '../node-client'
import { brotli } from './brotli'
import { brotliDecompressSync } from 'zlib'


describe('node/middlewares/brotli', () => {
  it('should', async () => {
    const app = router()
    app.use(brotli()).get((req, res) => {
      return res.json({ message: 'foo bar bar' })
    })
    const cli = nodeClient(app)
    const res = await cli.get()
    expect(res.statusCode).toEqual(200)
    const body = await res.bodyAsString()
    console.log(body)
    expect(brotliDecompressSync(Buffer.from(body)).toString('hex')).toEqual('')
  })
})

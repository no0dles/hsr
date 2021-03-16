import { router } from '../router'
import { nodeClient } from '../node-client'
import { jsonBody } from './json'

describe('plugins/json', () => {
  it('should handle json', async () => {
    const app = router()
    const cli = nodeClient(app)
    app
      .path('/api/todo')
      .use(jsonBody())
      .post(async (req, res) => {
        const data = await req.bodyAsJson()
        expect(data).toEqual({ message: 'test' })
        return res
      })
    const res = await cli.body(JSON.stringify({ message: 'test' })).post('/api/todo')
    expect(res.statusCode).toEqual(200)
  })
})

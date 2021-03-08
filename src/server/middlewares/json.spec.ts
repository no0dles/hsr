import { router } from '../router'
import { client } from '../../client/node/client'
import { jsonBody } from './json'

describe('plugins/json', () => {
  it('should handle json', async () => {
    const app = router()
    const cli = client(app)
    app
      .path('/api/todo')
      .use(jsonBody())
      .post(async (req) => {
        const data = await req.bodyAsJson()
        expect(data).toEqual({ message: 'test' })
        return req.ok()
      })
    const res = await cli.body(JSON.stringify({ message: 'test' })).post('/api/todo')
    expect(res.statusCode).toEqual(200)
  })
})

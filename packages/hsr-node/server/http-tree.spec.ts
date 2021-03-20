import { router } from './router'
import { nodeClient } from '../client/node-client'

describe('server/http-tree', () => {
  it('should handle get with param', async () => {
    const app = router()
    app
      .path('api')
      .path('todo')
      .param('id')
      .get(async (req, res, params) => {
        expect(params.id).toEqual('1')
        return res.body('todo')
      })
    const cli = nodeClient(app)
    const res = await cli.path('/api/todo/1').get()
    expect(res.statusCode).toEqual(200)
    expect(await res.bodyAsString()).toEqual('todo')
  })

  it('should handle multiple path segements', async () => {
    const app = router()
    app.path('api/todo').get((req, res) => res)
    const cli = nodeClient(app)
    const res = await cli.path('/api/todo').get()
    expect(res.statusCode).toEqual(200)
  })

  it('should handle 404', async () => {
    const app = router()
    const cli = nodeClient(app)
    const res = await cli.path('/api/todo').get()
    expect(res.statusCode).toEqual(404)
  })
})

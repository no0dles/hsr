import { router } from './router'
import { client } from '../client/node/client'

describe('server/http-tree', () => {
  it('should handle get with param', async () => {
    const app = router()
    app
      .path('api')
      .path('todo')
      .param('id')
      .get(async (req, params) => {
        expect(params.id).toEqual('1')
        return req.ok('todo')
      })
    const cli = client(app)
    const res = await cli.path('/api/todo/1').get()
    expect(res.statusCode).toEqual(200)
    expect(await res.bodyAsString()).toEqual('todo')
  })

  it('should handle multiple path segements', async () => {
    const app = router()
    app.path('api/todo').get((req) => req.ok())
    const cli = client(app)
    const res = await cli.path('/api/todo').get()
    expect(res.statusCode).toEqual(200)
  })

  it('should handle 404', async () => {
    const app = router()
    const cli = client(app)
    const res = await cli.path('/api/todo').get()
    expect(res.statusCode).toEqual(404)
  })
})

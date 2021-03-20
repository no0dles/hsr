import { router } from '../../server/router'
import { cors } from './cors'
import { nodeClient } from '../../client/node-client'

describe('plugins/cors', () => {
  it('should add cors headers', async () => {
    const app = router()
    app
      .use(cors())
      .path('api/todo')
      .get((req, res) => {
        return res
      })
    const client = nodeClient(app)
    const corsRes = await client.path('/api/todo').header('origin', 'example.com').options()
    expect(corsRes.statusCode).toEqual(204)
    expect(corsRes.header('Access-Control-Allow-Origin')).toEqual('example.com')

    const res = await client.path('/api/todo').get()
    expect(res.statusCode).toEqual(200)
    expect(res.header('Access-Control-Allow-Origin')).toEqual('*')
  })

  it('should not override existing cors headers', async () => {
    const app = router()
    app
      .use(cors())
      .path('api/todo')
      .get((req, res) => {
        return res
          .header('Access-Control-Allow-Origin', 'example.com')
          .header('Access-Control-Allow-Credentials', 'false')
      })
    const client = nodeClient(app)
    const res = await client.get('/api/todo')
    expect(res.statusCode).toEqual(200)
    expect(res.header('Access-Control-Allow-Origin')).toEqual('example.com')
    expect(res.header('Access-Control-Allow-Credentials')).toEqual('false')
  })
})

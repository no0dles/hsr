import { router } from '../router'
import { cors } from './cors'
import { client } from '../../client/node/client'

describe('plugins/cors', () => {
  it('should add cors headers', async () => {
    const app = router()
    app
      .use(cors())
      .path('api/todo')
      .get((req) => {
        return req.ok()
      })
    const cli = client(app)
    const corsRes = await cli.path('/api/todo').header('origin', 'example.com').options()
    expect(corsRes.statusCode).toEqual(204)
    expect(corsRes.header('Access-Control-Allow-Origin')).toEqual('example.com')

    const res = await cli.path('/api/todo').get()
    expect(res.statusCode).toEqual(200)
    expect(res.header('Access-Control-Allow-Origin')).toEqual('*')
  })

  it('should not override existing cors headers', async () => {
    const app = router()
    app
      .use(cors())
      .path('api/todo')
      .get((req) => {
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': 'example.com',
            'Access-Control-Allow-Credentials': 'false',
          },
        }
      })
    const cli = client(app)
    const res = await cli.get('/api/todo')
    expect(res.statusCode).toEqual(200)
    expect(res.header('Access-Control-Allow-Origin')).toEqual('example.com')
    expect(res.header('Access-Control-Allow-Credentials')).toEqual('false')
  })
})

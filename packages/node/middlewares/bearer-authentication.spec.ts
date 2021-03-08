import { router } from '../router'
import { bearerAuthentication } from './bearer-authentication'
import { nodeClient } from '../node-client'

describe('plugins/bearer-authentication', () => {
  it('should skip if not required and no token set', async () => {
    const app = router()
    app
      .use(bearerAuthentication())
      .path('api/todo')
      .get((req) => {
        expect(req.auth).toEqual(null)
        return req.ok()
      })
    const cli = nodeClient(app)
    const res = await cli
      .path('api/todo')
      .get()
    expect(res.statusCode).toEqual(200)
  })

  it('should not allow req if required and no token set', async () => {
    const app = router()
    app
      .use(bearerAuthentication({required:true}))
      .path('api/todo')
      .get((req) => {
        expect(req.auth).toEqual(null)
        return req.ok()
      })
    const cli = nodeClient(app)
    const res = await cli
      .path('api/todo')
      .get()
    expect(res.statusCode).toEqual(401)
  })

  it('should parse bearer token', async () => {
    const app = router()
    app
      .use(bearerAuthentication())
      .path('api/todo')
      .get((req) => {
        expect(req.auth).toEqual({
          header: { alg: 'HS256', typ: 'JWT' },
          payload: { sub: '1234567890', name: 'John Doe', iat: 1516239022 },
          signature: 'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
        })
        return req.ok()
      })
    const cli = nodeClient(app)
    await cli
      .path('api/todo')
      .header(
        'Authorization',
        `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`
      )
      .get()
  })

  it('should return bad response on invalid bearer token', async () => {
    const app = router()
    app
      .use(bearerAuthentication())
      .path('api/todo')
      .get((req) => {
        expect(req.auth).toEqual(null)
        return req.ok()
      })
    const cli = nodeClient(app)
    const res = await cli
      .path('api/todo')
      .header(
        'Authorization',
        `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ`
      )
      .get()
    expect(res.statusCode).toEqual(400)
  })

  it('should return bad response on invalid bearer token 2', async () => {
    const app = router()
    app
      .use(bearerAuthentication())
      .path('api/todo')
      .get((req) => {
        expect(req.auth).toEqual(null)
        return req.ok()
      })
    const cli = nodeClient(app)
    const res = await cli
      .path('api/todo')
      .header(
        'Authorization',
        `Bearer 123.2asd.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ`
      )
      .get()
    expect(res.statusCode).toEqual(400)
  })
})

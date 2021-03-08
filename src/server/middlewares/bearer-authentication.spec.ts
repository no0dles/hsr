import { router } from '../router'
import { bearerAuthentication } from './bearer-authentication'
import { client } from '../../client/node/client'

describe('plugins/bearer-authentication', () => {
  it('should parse bearer token', async () => {
    const app = router()
    app
      .use(bearerAuthentication())
      .path('api/todo')
      .get((req) => {
        expect(req.auth).toEqual({
          header: { alg: 'HS256', typ: 'JWT' },
          payload: { sub: '1234567890', name: 'John Doe', iat: 1516239022 },
        })
        return req.ok()
      })
    const cli = client(app)
    await cli
      .path('api/todo')
      .header(
        'Authorization',
        `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`
      )
      .get()
  })
})

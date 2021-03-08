import { router } from '../router'
import { basicAuthentication } from './basic-authentication'
import { client } from '../../client/node/client'

describe('plugins/base-authentication', () => {
  it('should decode basic auth', async () => {
    const app = router()
    app.use(basicAuthentication()).get((req) => {
      expect(req.auth).toEqual({ username: 'foo', password: 'bar' })
      return req.ok()
    })
    const cli = client(app)
    await cli.header('Authorization', `Basic ${Buffer.from('foo:bar').toString('base64')}`).get()
  })

  it('should required decode basic auth', async () => {
    const app = router()
    app.use(basicAuthentication({ required: true })).get((req) => {
      expect(req.auth).toEqual({ username: 'foo', password: 'bar' })
      return req.ok()
    })
    const cli = client(app)
    const res = await cli.get()
    expect(res.statusCode).toEqual(401)
  })
})

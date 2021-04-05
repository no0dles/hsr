import { nodeClient } from '@no0dles/hsr-node/client/node-client'
import { router } from '@no0dles/hsr-node/server/router'
import { basicAuthentication } from '@no0dles/hsr-node/middlewares/basic-authentication/basic-authentication'

describe('plugins/base-authentication', () => {
  it('should allow when not required', async () => {
    const app = router()
    app.use(basicAuthentication()).get((req, res) => {
      expect(req.auth).toEqual(null)
      return res
    })
    const cli = nodeClient(app)
    await cli.get()
    await cli.close()
  })

  it('should decode basic auth', async () => {
    const app = router()
    app.use(basicAuthentication()).get((req, res) => {
      expect(req.auth).toEqual({ username: 'foo', password: 'bar' })
      return res
    })
    const cli = nodeClient(app)
    await cli.header('Authorization', `Basic ${Buffer.from('foo:bar').toString('base64')}`).get()
    await cli.close()
  })

  it('should required decode basic auth', async () => {
    const app = router()
    app.use(basicAuthentication({ required: true })).get((req, res) => {
      expect(req.auth).toEqual({ username: 'foo', password: 'bar' })
      return res
    })
    const cli = nodeClient(app)
    const res = await cli.get()
    expect(res.statusCode).toEqual(401)
    await cli.close()
  })

  it('should not accept invalid header', async () => {
    const app = router()
    app.use(basicAuthentication({ required: true })).get((req, res) => {
      expect(req.auth).toEqual({ username: 'foo', password: 'bar' })
      return res
    })
    const cli = nodeClient(app)
    const res = await cli.header('Authorization', 'Basic foo:bar').get()
    expect(res.statusCode).toEqual(400)
    await cli.close()
  })
})

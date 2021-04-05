import { nodeClient } from '@no0dles/hsr-node/client/node-client'
import { router } from '@no0dles/hsr-node/server/router'
import { constant } from '@no0dles/hsr-node/middlewares/constant/constant'

describe('plugins/constant', () => {
  it('should', async () => {
    const app = router()
    app.use(constant('magicValue', 42)).get((req, res) => {
      expect(req.constant.magicValue).toEqual(42)
      return res
    })
    const cli = nodeClient(app)
    const res = await cli.get()
    expect(res.statusCode).toEqual(200)
    await cli.close()
  })
})

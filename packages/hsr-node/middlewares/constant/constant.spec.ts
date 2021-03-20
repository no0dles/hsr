import { router } from '../../server/router'
import { constant } from './constant'
import { nodeClient } from '../../client/node-client'

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
  })
})

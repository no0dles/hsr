import { router } from '../router'
import { constant } from './constant'
import { nodeClient } from '../node-client'

describe('plugins/constant', () => {
  it('should', async () => {
    const app = router()
    app.use(constant('magicValue', 42)).get((req) => {
      expect(req.constant.magicValue).toEqual(42)
      return req.ok()
    })
    const cli = nodeClient(app)
    const res = await cli.get()
    expect(res.statusCode).toEqual(200)
  })
})

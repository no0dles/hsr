import { nodeClient } from '@no0dles/hsr-node/client/node-client'
import { router } from '@no0dles/hsr-node/server/router'
import { logger } from '@no0dles/hsr-node/middlewares/logger/logger'

describe('plugins/logger', () => {
  it('should log request', async () => {
    const app = router()
    app.use(logger()).get(async (req, res) => {
      req.log('info', 'before promise')
      return new Promise((resolve) => {
        setTimeout(() => {
          req.log('info', 'after timeout')
          resolve(res)
        }, 100)
      })
    })
    const cli = nodeClient(app)
    await cli.get('/')
    await cli.close()
  })
})

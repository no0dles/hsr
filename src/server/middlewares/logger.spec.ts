import { router } from '../router'
import { client } from '../../client/node/client'
import { logger } from './logger'

describe('plugins/logger', () => {
  it('should log request', async () => {
    const app = router()
    app.use(logger()).get(async (req) => {
      req.log('info', 'before promise')
      return new Promise((resolve) => {
        setTimeout(() => {
          req.log('info', 'after timeout')
          resolve(req.ok())
        }, 100)
      })
    })
    const cli = client(app)
    await cli.get('/')
  })
})

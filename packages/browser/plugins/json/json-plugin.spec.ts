import { nodeClient } from '../../../node/node-client'
import { router } from '../../../node/router'
import { jsonBody } from '../../../node/middlewares/json'
import { jsonPlugin } from './json-plugin'

describe('client/plugins/json', () => {
  it('should', async () => {
    const app = router()
    app.use(jsonBody()).post(async (req) => {
      expect(await req.bodyAsJson()).toEqual({ message: 'request' })
      return req.ok({ message: 'response' })
    })
    const cli = await nodeClient(app).plugin(jsonPlugin()).json({ message: 'request' }).post()
    const data = await cli.bodyAsString()
    expect(JSON.parse(data)).toEqual({ message: 'response' })
  })
})

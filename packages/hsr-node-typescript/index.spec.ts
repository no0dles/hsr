import { router } from '../hsr-node/server/router'
import { nodeClient } from '../hsr-node/client/node-client'
import { join } from 'path'
import { typescriptPlugin } from './index'

describe('plugins/static-typescript', () => {
  it('should serve index', async () => {
    const app = router()
    app.path('static').plugin(typescriptPlugin({ recursive: true, rootDir: join(__dirname, 'src') }))
    const cli = nodeClient(app)
    const res = await cli.path('static/index.js').get()
    expect(res.statusCode).toEqual(200)
    console.log(await res.bodyAsString())
  })

  it('should serve referenced file', async () => {
    const app = router()
    app.path('static').plugin(typescriptPlugin({ recursive: true, rootDir: join(__dirname, 'src') }))
    const cli = nodeClient(app)
    const res = await cli.path('static/util').get()
    expect(res.statusCode).toEqual(200)
    console.log(await res.bodyAsString())
  })
})

import { join } from 'path'
import { nodeClient } from '@no0dles/hsr-node/client/node-client'
import { router } from '@no0dles/hsr-node/server/router'
import { typescriptPlugin } from '@no0dles/hsr-node-typescript/typescript-plugin'

describe('plugins/static-typescript', () => {
  const app = router()
  app.path('static').plugin(
    typescriptPlugin({
      rootDir: join(__dirname, 'src'),
      entryFiles: [join(__dirname, 'src/index.ts')],
    })
  )
  const cli = nodeClient(app)

  it('should serve index', async () => {
    const res = await cli.path('static/index.js').get()
    expect(res.statusCode).toEqual(200)
    console.log(await res.bodyAsString())
  })

  it('should serve referenced file', async () => {
    const res = await cli.path('static/util').get()
    expect(res.statusCode).toEqual(200)
    console.log(await res.bodyAsString())
  })

  afterAll(async () => await cli.close())
})

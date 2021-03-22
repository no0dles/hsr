import { router } from '../../../../../packages/hsr-node/server/router'
import { nodeClient } from '../../../../../packages/hsr-node/client/node-client'
import { readFileSync } from 'fs'
import { join } from 'path'
import { staticPlugin } from '../../../../../packages/hsr-node-static'

describe('plugins/static', () => {
  const indexFile = readFileSync(join(__dirname, 'assets', 'index.html')).toString()
  const styleFile = readFileSync(join(__dirname, 'assets', 'css/style.css')).toString()

  it('should serve static files', async () => {
    const app = router()
    app.path('static').plugin(
      staticPlugin({
        rootDir: join(__dirname, 'assets'),
      })
    )
    const cli = nodeClient(app)
    const res = await cli.path('static/index.html').get()
    expect(res.statusCode).toEqual(200)
    expect(await res.bodyAsString()).toEqual(indexFile)
    await cli.close()
  })

  it('should not serve nested static files without recursive', async () => {
    const app = router()
    app.path('static').plugin(
      staticPlugin({
        rootDir: join(__dirname, 'assets'),
      })
    )
    const cli = nodeClient(app)
    const res = await cli.path('static/css/style.css').get()
    expect(res.statusCode).toEqual(404)
    await cli.close()
  })

  it('should serve nested static files', async () => {
    const app = router()
    app.path('static').plugin(
      staticPlugin({
        rootDir: join(__dirname, 'assets'),
        recursive: true,
      })
    )
    const cli = nodeClient(app)
    const res = await cli.path('static/css/style.css').get()
    expect(res.statusCode).toEqual(200)
    expect(await res.bodyAsString()).toEqual(styleFile)
    await cli.close()
  })

  it('should serve return 404 on non existing files', async () => {
    const app = router()
    app.path('static').plugin(
      staticPlugin({
        rootDir: join(__dirname, 'assets'),
      })
    )
    const cli = nodeClient(app)
    const res = await cli.path('static/index2.html').get()
    expect(res.statusCode).toEqual(404)
    await cli.close()
  })

  it('should serve index on directory', async () => {
    const app = router()
    app.path('static').plugin(
      staticPlugin({
        rootDir: join(__dirname, 'assets'),
      })
    )
    const cli = nodeClient(app)
    const res = await cli.path('static').get()
    expect(res.statusCode).toEqual(200)
    expect(await res.bodyAsString()).toEqual(indexFile)
    await cli.close()
  })
})

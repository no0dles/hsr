import { router } from '../../../hsr-node/server/router'
import { nodeClient } from '../../../hsr-node/client/node-client'
import { brotli, nodeBrotliClient } from '../../../hsr-node/middlewares/compression/brotli'
import { remote } from 'webdriverio'
import { getServer } from '../../../hsr-node/server/server'
import { staticPlugin } from '../../../hsr-node/plugins/static/static'
import { typescriptPlugin } from '../../../hsr-node-typescript'
import { HttpClientResponse } from '../../../hsr-browser/http-client-response'

describe('node/middlewares/brotli', () => {
  it('should not use brotli if client does not support it', async () => {
    const app = router()
    app.use(brotli()).get((req, res) => {
      return res.json({ message: 'foo bar bar' })
    })
    const cli = nodeClient(app)
    const res = await cli.get()
    expect(res.statusCode).toEqual(200)
    const body = await res.bodyAsJson()
    expect(body).toEqual({ message: 'foo bar bar' })
  })

  it('should use brotli if client supports it', async () => {
    const app = router()
    app.use(brotli()).get((req, res) => {
      return res.json({ message: 'foo bar bar' })
    })
    const cli = nodeClient(app).use(nodeBrotliClient())
    const res = await cli.get()
    expect(res.statusCode).toEqual(200)
    const body = await res.bodyAsJson()
    expect(body).toEqual({ message: 'foo bar bar' })
  })

  it('should work in browser', async () => {
    const browser = await remote({
      capabilities: {
        browserName: 'chrome',
      },
    })

    const app = router().use(brotli())
    app.path('/api/test').get((req, res) => {
      return res.json({ message: 'foo bar bar' })
    })
    app.plugin(staticPlugin({ rootDir: __dirname }))
    app.plugin(
      typescriptPlugin({
        rootDir: process.cwd(),
        exclude: ['node_modules'],
      })
    )

    await new Promise<void>((resolve) => {
      const srv = getServer(app).listen(0, async () => {
        await browser.navigateTo('http://localhost:' + (srv.address() as any).port + '/brotli.html')
        const res = await browser.executeAsync<HttpClientResponse, []>((done) => {
          ;(window as any).result.then((res) => done(res))
        })
        expect(res).toEqual({ message: 'foo bar bar' })
        resolve()
        srv.close()
      })
    })
    await browser.deleteSession()
  })
})

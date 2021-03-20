import { remote } from 'webdriverio'
import { router } from '../hsr-node/server/router'
import { getServer } from '../hsr-node/server/server'
import { staticPlugin } from '../hsr-node/plugins/static/static'
import { join } from 'path'
import { HttpClientResponse } from '../hsr-browser/http-client-response'
import { typescriptPlugin } from '../hsr-node-typescript'

describe('client/browser', () => {
  it('should login with valid credentials', async () => {
    const browser = await remote({
      capabilities: {
        browserName: 'chrome',
      },
    })

    const server = router()
    server.path('/api/hello').get((req, res) => {
      return res.statusCode(200)
    })

    server.plugin(
      staticPlugin({
        rootDir: join(__dirname, '.'),
      })
    )

    server.plugin(
      typescriptPlugin({
        rootDir: join(__dirname, '.'),
      })
    )

    await new Promise<void>((resolve) => {
      const srv = getServer(server).listen(0, async () => {
        await browser.navigateTo('http://localhost:' + (srv.address() as any).port)
        const res = await browser.executeAsync<HttpClientResponse, []>((done) => {
          ;(window as any).client.get().then((res) => done(res))
        })
        expect(res.statusCode).toEqual(200)
        resolve()
      })
    })
    await browser.deleteSession()
  })
})

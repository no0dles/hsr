import { remote } from 'webdriverio'
import { router } from '../node/router'
import { getServer } from '../node/server'
import { staticPlugin } from '../node/plugins/static/static'
import { join } from 'path'
import { HttpClientResponse } from './http-client-response'
import { typescriptPlugin } from '../node/plugins/typescript/typescript'

describe('client/browser', () => {
  it('should login with valid credentials', async () => {
    const browser = await remote({
      capabilities: {
        browserName: 'chrome',
      },
    })

    const server = router()
    server
      .path('/api/hello').get((req, res) => {
      return res.statusCode(200)
    })

    server
      .plugin(staticPlugin({
        rootDir: join(__dirname, '.'),
      }))

    server.plugin(typescriptPlugin({
      rootDir: join(__dirname, '.'),
    }))

    await new Promise<void>((resolve) => {
      const srv = getServer(server).listen(0, async () => {

        await browser.navigateTo('http://localhost:' + (srv.address() as any).port)
        const res = await browser.executeAsync<HttpClientResponse, []>((done) => {
          (window as any).client.get().then(res => done(res))
        })
        expect(res.statusCode).toEqual(200)
        resolve()
      })
    })
    await browser.deleteSession()
  })
})

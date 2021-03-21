import { router } from '../../../../../packages/hsr-node/server/router'
import { nodeClient } from '../../../../../packages/hsr-node/client/node-client'
import { brotli, nodeBrotliClient } from '../../../../../packages/hsr-node/middlewares/compression/brotli'
import { getServer } from '../../../../../packages/hsr-node/server/server'
import { staticPlugin } from '../../../../../packages/hsr-node/plugins/static/static'
import { typescriptPlugin } from '../../../../../packages/hsr-node-typescript/typescript-plugin'
import { join } from 'path'
import * as puppeteer from 'puppeteer'
import { HTTPResponse } from 'puppeteer'

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
    const browser = await puppeteer.launch()

    try {
      const app = router().use(brotli())
      app.path('/api/test').get((req, res) => {
        return res.json({ message: 'foo bar bar' })
      })
      app.plugin(staticPlugin({ rootDir: __dirname }))
      app.plugin(
        typescriptPlugin({
          recursive: true,
          rootDir: join(process.cwd(), '../..'),
          exclude: ['node_modules'],
        }),
      )

      await new Promise<void>((resolve, reject) => {
        const srv = getServer(app).listen(0, async () => {
          try {

            const page = await browser.newPage()
            page
              .on('console', message =>
                console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`))
              .on('pageerror', ({ message }) => console.log(message))
              .on('response', response =>
                console.log(`${response.status()} ${response.url()}`))
              .on('requestfailed', request =>
                console.log(`${request.failure().errorText} ${request.url()}`))
            await page.goto('http://localhost:' + (srv.address() as any).port + '/brotli.html')
            const response = await page.waitForResponse((res: HTTPResponse) => {
              return res.url().endsWith('/api/test')
            })
            expect(response.headers()['content-encoding']).toEqual('br')
            const result = await page.evaluate(() => (<any>window).result.then((r: any) => r.bodyAsJson()))
            expect(result).toEqual({ message: 'foo bar bar' })
            resolve()
          } catch (e) {
            reject(e)
          } finally {
            srv.close()
          }
        })
      })
    } finally {
      await browser.close()
    }
  })
})
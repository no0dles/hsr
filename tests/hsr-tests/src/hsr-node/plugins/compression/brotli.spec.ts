import puppeteer from 'puppeteer'
import { HTTPResponse } from 'puppeteer'
import { nodeClient } from '@no0dles/hsr-node/client/node-client'
import { router } from '@no0dles/hsr-node/server/router'
import { staticPlugin } from '@no0dles/hsr-node-static/index'
import { brotli, nodeBrotliClient } from '@no0dles/hsr-node/middlewares/compression/brotli'
import { listenHttp } from '@no0dles/hsr-node/server/server'

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
    await cli.close()
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
    await cli.close()
  })

  it('should use brotli and no content length for static', async () => {
    const app = router().use(brotli());
    app.plugin(staticPlugin({ rootDir: __dirname }))
    const cli = nodeClient(app).use(nodeBrotliClient())
    const res = await cli.get('/main.js')
    expect(res.statusCode).toEqual(200)
    expect(res.header('content-length')).toBeNull();
    await cli.close()
  })

  it('should work in browser', async () => {
    const browser = await puppeteer.launch()

    try {
      const app = router().use(brotli())
      app.path('/api/test').get((req, res) => {
        return res.json({ message: 'foo bar bar' })
      })
      app.plugin(staticPlugin({ rootDir: __dirname }))

      const server = await listenHttp(app)
      try {
        const page = await browser.newPage()
        page
          .on('console', (message) => console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`))
          .on('pageerror', ({ message }) => console.log(message))
          .on('response', (response) => console.log(`${response.status()} ${response.url()}`))
          .on('requestfailed', (request) => console.log(`${request.failure().errorText} ${request.url()}`))
        await page.goto('http://localhost:' + (server.address() as any).port + '/brotli.html')
        const response = await page.waitForResponse((res: HTTPResponse) => {
          return res.url().endsWith('/api/test')
        })
        expect(response.headers()['content-encoding']).toEqual('br')
        const result = await page.evaluate(() => (<any>window).result)
        expect(result).toEqual({ message: 'foo bar bar' })
      } finally {
        server.close()
      }
    } finally {
      await browser.close()
    }
  })
})

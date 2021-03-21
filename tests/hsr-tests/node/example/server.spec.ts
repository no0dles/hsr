import { getServer } from '../../../../packages/hsr-node/server/server'
import { httpApp } from './server'
import * as puppeteer from 'puppeteer'
import { HTTPResponse } from 'puppeteer'


describe('node/rpc', () => {
  it('should work with rpc in browser', async () => {
    const browser = await puppeteer.launch()
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


      await new Promise<void>((resolve) => {
        const srv = getServer(httpApp).listen(0, async () => {
          await page.goto('http://localhost:' + (srv.address() as any).port)
          const response = await page.waitForResponse((res: HTTPResponse) => {
            return res.url().endsWith('/api/rpc/foo')
          })
          const result = await page.evaluate(() => (<any>window).result)
          expect(result).toEqual({ message: 'footest' })
          resolve()
        })
      })
    } finally {
      await browser.close()
    }
  })
})

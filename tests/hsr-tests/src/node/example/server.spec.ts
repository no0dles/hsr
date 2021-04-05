import { httpApp } from './server'
import puppeteer from 'puppeteer'
import { HTTPResponse } from 'puppeteer'
import { listenHttp } from '@no0dles/hsr-node/server/server'

describe('node/rpc', () => {
  xit('should work with rpc in browser', async () => {
    const browser = await puppeteer.launch()
    try {
      const page = await browser.newPage()
      page
        .on('console', (message) => console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`))
        .on('pageerror', ({ message }) => console.log(message))
        .on('response', (response) => console.log(`${response.status()} ${response.url()}`))
        .on('requestfailed', (request) => console.log(`${request.failure().errorText} ${request.url()}`))

      const server = await listenHttp(httpApp)
      try {
        await page.goto('http://localhost:' + (server.address() as any).port)
        const response = await page.waitForResponse((res: HTTPResponse) => {
          return res.url().endsWith('/api/rpc/foo')
        })
        const result = await page.evaluate(() => (<any>window).result)
        expect(result).toEqual({ message: 'footest' })
      } finally {
        server.close()
      }
    } finally {
      await browser.close()
    }
  })
})

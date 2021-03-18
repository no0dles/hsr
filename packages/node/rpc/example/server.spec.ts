import { remote } from 'webdriverio'
import { httpApp } from './server'
import { getServer } from '../../server'
import { HttpClientResponse } from '../../../browser'

describe('node/rpc', () => {
  it('should work with rpc in browser', async () => {
    const browser = await remote({
      capabilities: {
        browserName: 'chrome',
      },
    })

    await new Promise<void>((resolve) => {
      const srv = getServer(httpApp).listen(0, async () => {
        await browser.navigateTo('http://localhost:' + (srv.address() as any).port)
        const res = await browser.executeAsync<HttpClientResponse, []>((done) => {
          (window as any).result.then(res => done(res))
        })
        expect(res).toEqual({ message: 'footest' })
        resolve()
      })
    })
    await browser.deleteSession()
  })
})

import {remote} from 'webdriverio'
import { router } from '../../server/router'
import { getServer } from '../../server/server'
import { appRouter } from '../../server/rpc-server'
import { rpcClient } from '../rpc/rpc-client'

describe('client/browser', () => {
  it('should login with valid credentials', async () => {
    const browser = await remote({
      capabilities: {
        browserName: 'chrome',
      },
    })

    const server = router()
    await new Promise<void>((resolve) => {
      getServer(server).listen(3000, async () => {
        const res = await browser.execute(() => {
          const client = rpcClient<typeof appRouter>('http://localhost:3000')
          console.log(client)
          client.call('foo').then(res => {
            console.log(res)
          })

          console.log(window)
          return window.location
        })
        console.log(res)
        resolve()
      })
    })
    await browser.deleteSession()
  })
})

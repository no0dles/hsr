import { remote } from 'webdriverio'
import { getServer } from '../../../hsr-node/server/server'
import { string, type } from 'io-ts'
import { getRpcHttpPlugin, rpcServer } from 'hsr-node-rpc/rpc-server'
import { router } from '../../../hsr-node/server/router'
import { staticPlugin } from '../../../hsr-node/plugins/static/static'
import { join } from 'path'
import { HttpClientResponse } from '../../../hsr-browser/http-client-response'
import { typescriptPlugin } from '../../../hsr-node-typescript'

const fooDecoder = type({
  value: string,
})
export const rpcApp = rpcServer().cmd('foo', fooDecoder, (req) => {
  return {
    message: 'foo' + req.value,
  }
})

export const httpApp = router()
httpApp.plugin(
  staticPlugin({
    rootDir: join(__dirname, 'static'),
    exclude: ['node_modules'],
  })
)
httpApp.plugin(typescriptPlugin({ recursive: true, exclude: ['node_modules'], rootDir: process.cwd() }))
httpApp.plugin(getRpcHttpPlugin(rpcApp))

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
          ;(window as any).result.then((res) => done(res))
        })
        expect(res).toEqual({ message: 'footest' })
        resolve()
      })
    })
    await browser.deleteSession()
  })
})

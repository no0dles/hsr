import type { rpcApp } from '../server'
import { rpcBrowserClient } from '../../../../../packages/hsr-browser-rpc/rpc-browser-client'

const client = rpcBrowserClient<typeof rpcApp>()
console.log(client)
;(<any>window).result = client.call('foo', { value: 'test' })

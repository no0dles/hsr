import { rpcBrowserClient } from '../../../../hsr-browser-rpc/rpc-client'
import type { rpcApp } from '../server'

const client = rpcBrowserClient<typeof rpcApp>()
const result = client.call('foo', { value: 'test' })

// @ts-ignore
window.result = result

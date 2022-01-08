import { type, string } from 'io-ts'
import { rpcServer } from '@no0dles/hsr-node-rpc'
import { router } from '@no0dles/hsr-node'
import { listenHttp } from '@no0dles/hsr-node'
import { cmd } from '@no0dles/hsr-browser-rpc'
import { buildHttpPlugin } from '@no0dles/hsr-node-rpc'
import { ValidationError } from '@no0dles/hsr-browser-rpc'
import {rpcNodeClient} from '@no0dles/hsr-node-rpc/client';

describe('rpc', () => {
    it('should execute rpc', async () => {
        const fooDecoder = type({
            value: string,
        })
        const rpcApp = {
            'foo': cmd(fooDecoder).as<{ message: string }>(),
        }
        const rpcServ = rpcServer(rpcApp, {
            foo: async (req) => {
                return {
                    message: 'foo' + req.value,
                }
            },
        })

        const app = router()
        app.plugin(buildHttpPlugin(rpcServ))
        const server = await listenHttp(app)

        const client = rpcNodeClient('http://localhost:' + (<any>server.address()).port, rpcApp)
        const res = await client['foo'].call({
            value: 'test',
        })
        expect(res.message).toEqual('footest')
        server.close()
    })

    it('should execute rpc without return value', async () => {
        const fooDecoder = type({
            value: string,
        })
        const rpcApp = {
            'foo': cmd(fooDecoder),
        }
        const rpcServ = rpcServer(rpcApp, {
            foo: async (req) => {
                return
            },
        })

        const app = router()
        app.plugin(buildHttpPlugin(rpcServ))
        const server = await listenHttp(app)

        const client = rpcNodeClient('http://localhost:' + (<any>server.address()).port, rpcApp)
        const resPromise = client.foo.call({
            value: 'test',
        })
        const res = await resPromise
        console.log(res)
        server.close()
    })

    it('should execute throw validation error', async () => {
        const fooDecoder = type({
            value: string,
        })
        const rpcApp = {
            'foo': cmd(fooDecoder).as<{ message: string }>(),
        }
        const rpcServ = rpcServer(rpcApp, {
            foo: async (req) => {
                return {
                    message: 'foo' + req.value,
                }
            },
        })

        const app = router()
        app.plugin(buildHttpPlugin(rpcServ))
        const server = await listenHttp(app)

        const client = rpcNodeClient('http://localhost:' + (<any>server.address()).port, rpcApp)
        try {
            await client.foo.call({} as any)
            expect(false).toBeTruthy();
        } catch (e) {
            expect(e).toBeInstanceOf(ValidationError);
        }
        server.close()
    })
})

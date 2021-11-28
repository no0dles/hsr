import { nodeClient } from '@no0dles/hsr-node/client/node-client'
import { RpcClientApp } from '@no0dles/hsr-browser-rpc/app'
import { RpcClientFunction } from '@no0dles/hsr-browser-rpc/function'
import { ValidationError } from '@no0dles/hsr-browser-rpc/validation-error'

export function rpcNodeClient<T>(url: string, definition: T): RpcClientApp<T> {
  const client = nodeClient(url)
  return Object.keys(definition).reduce<RpcClientApp<any>>((app, key) => {
    const rpcClient: RpcClientFunction<any, any> = {
      async call(arg: any): Promise<any> {
        const result = await client.body(JSON.stringify(arg)).post(`/api/rpc/${key}`)
        if (result.statusCode === 204) {
          return
        }
        if (result.statusCode === 400) {
          const data = await result.bodyAsJson<{errors: string[]}>()
          throw new ValidationError(data.errors)
        }
        return await result.bodyAsJson();
      },
    };
    app[key] = rpcClient;
    return app;
  }, {});
}

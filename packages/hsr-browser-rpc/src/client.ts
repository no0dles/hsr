import {RpcClientFunction} from './function';
import {RpcClientApp} from './app';
import { browserClient } from '@no0dles/hsr-browser'
import { ValidationError } from './validation-error'

export function rpcBrowserClient<T>(url: string, definition: T): RpcClientApp<T> {
  const client = browserClient(url)
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

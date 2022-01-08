import {RpcClientFunction} from './function';
import {RpcClientApp} from './app';
import {browserClient} from '@no0dles/hsr-browser';
import {ValidationError} from './validation-error';
import {HttpClientResponse} from '@no0dles/hsr-browser/dist/esm';

export type RpcBrowserClientErrorHandler = (res: HttpClientResponse) => Promise<Error | null>;

export interface RpcBrowserClientOptions {
  errorHandler: RpcBrowserClientErrorHandler;
}

export class BadRequestError extends Error {
  constructor(public headers: { [key: string]: string | string[] }, public body: any) {
    super('bad request');
  }
}

export function rpcBrowserClient<T>(url: string, definition: T, options?: Partial<RpcBrowserClientOptions>): RpcClientApp<T> {
  const client = browserClient(url);
  const errorHandler: RpcBrowserClientErrorHandler = options?.errorHandler ?? (async res => {
    const contentType = res.header('Content-Type');
    if (contentType === 'application/json') {
      const body = await res.bodyAsJson<any>();
      if (typeof body === 'object' && body.hasOwnProperty('errors') && body.errors instanceof Array) {
        return new ValidationError(body.errors);
      }

      return new BadRequestError(res.headers(), body);
    }

    return new BadRequestError(res.headers(), await res.bodyAsString());
  });
  return Object.keys(definition).reduce<RpcClientApp<any>>((app, key) => {
    const rpcClient: RpcClientFunction<any, any> = {
      async call(arg: any): Promise<any> {
        const result = await client.body(JSON.stringify(arg)).post(`/api/rpc/${key}`);
        if (result.statusCode === 204) {
          return;
        }
        if (result.statusCode === 200) {
          return await result.bodyAsJson();
        }

        const error = errorHandler(result);
        if (error) {
          throw error;
        }
      },
    };
    app[key] = rpcClient;
    return app;
  }, {});
}

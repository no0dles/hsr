import {RpcClientEndpoint} from './endpoint';

export type RpcClientApp<T> = { [P in keyof T]: RpcClientEndpoint<T[P]> }

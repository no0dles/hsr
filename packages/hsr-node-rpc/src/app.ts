import {RpcServerHandle} from './handle';

export type RpcServerApp<T> = { [P in keyof T]: RpcServerHandle<T[P]> }

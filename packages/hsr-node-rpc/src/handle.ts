import { RpcServerFunction } from './function'
import { CmdArgument } from '@no0dles/hsr-browser-rpc'
import { CmdResult } from '@no0dles/hsr-browser-rpc'

export type RpcServerHandle<T> = RpcServerFunction<CmdArgument<T>, CmdResult<T>>;

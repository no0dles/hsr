import { RpcServerFunction } from './function'
import { CmdArgument } from '@no0dles/hsr-browser-rpc/cmd-argument'
import { CmdResult } from '@no0dles/hsr-browser-rpc/cmd-result'

export type RpcServerHandle<T> = RpcServerFunction<CmdArgument<T>, CmdResult<T>>;

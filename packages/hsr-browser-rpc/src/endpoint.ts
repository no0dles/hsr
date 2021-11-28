import {RpcClientFunction} from './function';
import {CmdArgument} from './cmd-argument';
import {CmdResult} from './cmd-result';

export type RpcClientEndpoint<T> = RpcClientFunction<CmdArgument<T>, CmdResult<T>>;

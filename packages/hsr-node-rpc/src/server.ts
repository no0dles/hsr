import {PathReporter} from 'io-ts/PathReporter';
import {RpcServerApp} from './app';
import {RpcServerHandle} from './handle';
import { CmdArgument } from '@no0dles/hsr-browser-rpc/cmd-argument'
import { Cmd } from '@no0dles/hsr-browser-rpc/cmd'
import { ValidationError } from '@no0dles/hsr-browser-rpc/validation-error'
import { CmdResult } from '@no0dles/hsr-browser-rpc/cmd-result'
import { ReturnCmd } from '@no0dles/hsr-browser-rpc/return-cmd'

export interface RpcServer<T> {
  handles: string[];

  execute<K extends string & keyof T>(name: K, arg: CmdArgument<T[K]>): Promise<CmdResult<T[K]>>;
}

export function rpcServer<T extends { [key: string]: Cmd<any> | ReturnCmd<any, any> }>(definition: T, handlers: RpcServerApp<T>): RpcServer<T> {
  const handles = Object.keys(handlers);
  return {
    handles,
    execute: async <K extends string & keyof T>(name: K, arg: CmdArgument<T[K]>): Promise<CmdResult<T[K]>> => {
      const def = definition[name] as Cmd<any> | ReturnCmd<any, any>;
      const val = def.decoder.decode(arg);
      if (val._tag === 'Left') {
        const errors = PathReporter.report(val)
        throw new ValidationError(errors);
      } else {
        const handle = handlers[name] as RpcServerHandle<any>;
        const result: any = await handle(val.right);
        return result;
      }
    },
  };
}

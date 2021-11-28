import {Cmd} from './cmd';
import {ReturnCmd} from './return-cmd';

export type CmdResult<T> = T extends Cmd<any> ? void : (T extends ReturnCmd<any, infer O> ? O : never)

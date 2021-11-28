import {Cmd} from './cmd';
import {ReturnCmd} from './return-cmd';

export type CmdArgument<T> = T extends Cmd<infer I> ? I : (T extends ReturnCmd<infer I, any> ? I : never)

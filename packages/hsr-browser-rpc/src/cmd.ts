import {Type} from 'io-ts';
import {ReturnCmd} from './return-cmd';

export class Cmd<I> {
  constructor(public decoder: Type<I>) {

  }

  as<O>(): ReturnCmd<I, O> {
    return new ReturnCmd<I, O>(this.decoder);
  }
}

export function cmd<I>(input: Type<I>): Cmd<I> {
  return new Cmd(input);
}


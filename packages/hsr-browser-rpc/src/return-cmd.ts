import {Type} from 'io-ts';

export class ReturnCmd<I, O> {
  constructor(public decoder: Type<I>) {

  }
}

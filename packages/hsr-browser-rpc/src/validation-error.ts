export class ValidationError extends Error {
  constructor(public validations: string[]) {
    super('invalid argument');
  }
}

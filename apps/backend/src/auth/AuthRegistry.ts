import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { CALL_CONTEXT_ATTRIBUTES } from './authContexts/CallAuthContext';
import { CallAuthFunctions } from './authFunctions/CallAuthFunctions';

type AuthFunction<TObj> = (role: string, obj: TObj) => Promise<boolean>;

export type AuthFunctionRegistry<TObj> = Record<string, AuthFunction<TObj>>;

export type AuthContext = {
  type: string;
};

@injectable()
export class AuthRegistry {
  public readonly contextAttributes = new Map<string, string[]>([
    ['call', CALL_CONTEXT_ATTRIBUTES],
  ]);

  public readonly functions: Map<string, AuthFunctionRegistry<any>>;

  constructor(
    @inject(Tokens.CallAuthFunctions) callAuthFunctions: CallAuthFunctions
  ) {
    this.functions = new Map([['call', callAuthFunctions.registry()]]);
  }
}

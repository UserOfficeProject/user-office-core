import { inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { CallDataSource } from '../../datasources/CallDataSource';
import { CallContextData } from '../authContexts/CallAuthContext';
import { UserContextData } from '../authContexts/UserAuthContext';
import { AuthFunctionRegistry } from '../AuthRegistry';

/*
 * Functions that can be used in Casbin conditions for the call resource.
 * Called by Casbin on a per-proposal basis for more complex conditions.
 * Using the context fields is preferable if the necessary data for the function
 * can be batch fetched and it can be easily expressed with logical operators in UI.
 */
@injectable()
export class CallAuthFunctions {
  constructor(
    @inject(Tokens.CallDataSource) private callDataSource: CallDataSource
  ) {}

  registry(): AuthFunctionRegistry<CallContextData> {
    return {
      // Forced examples that don't demonstrate this well
      isCallEnded: async (user: UserContextData, obj) => {
        return await this.callDataSource.isCallEnded(obj.id);
      },
      isCallEndedInternal: async (user: UserContextData, obj) => {
        return await this.callDataSource.isCallEnded(obj.id, true);
      },
    };
  }
}

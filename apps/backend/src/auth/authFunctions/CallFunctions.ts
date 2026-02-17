import { CallContextData } from '../authContexts/CallContext';
import { AuthFunctionRegistry } from '../AuthRegistry';

/*
 * Functions that can be used in Casbin conditions for the call resource.
 * Called by Casbin on a per-proposal basis for more complex conditions.
 * Using the context fields is preferable if the necessary data for the function
 * can be batch fetched and it can be easily expressed with logical operators in UI.
 */
export const callAuthFunctions: AuthFunctionRegistry<CallContextData> = {
  // Made up example
  isCallEnded: (user, obj) => {
    return true;
  },
};

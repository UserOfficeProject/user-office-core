import { CALL_CONTEXT_ATTRIBUTES } from './authContexts/CallContext';
import { callAuthFunctions } from './authFunctions/CallFunctions';

type AuthFunction<TObj> = (user: string, obj: TObj) => boolean;

export type AuthFunctionRegistry<TObj> = Record<string, AuthFunction<TObj>>;

export type AuthContext = {
  type: string;
};

export const contextAttributeRegistry = new Map<string, string[]>([
  ['call', CALL_CONTEXT_ATTRIBUTES],
]);

export const functionRegistry = new Map<string, AuthFunctionRegistry<any>>([
  ['call', callAuthFunctions],
]);

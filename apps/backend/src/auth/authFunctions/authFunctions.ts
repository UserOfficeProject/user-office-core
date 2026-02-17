import { callAuthFunctions } from './callFunctions';

type AuthFunction<TObj> = (user: string, obj: TObj) => boolean;

export type AuthFunctionRegistry<TObj> = Record<string, AuthFunction<TObj>>;

export const authFunctionRegistry = new Map<string, AuthFunctionRegistry<any>>([
  ['call', callAuthFunctions],
]);

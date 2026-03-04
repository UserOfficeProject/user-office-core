import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import {
  CALL_AUTH_UI_ATTRIBUTES,
  CallContextData,
} from './authContexts/CallAuthContext';
import {
  PROPOSAL_AUTH_UI_ATTRIBUTES,
  ProposalContextData,
} from './authContexts/ProposalAuthContext';
import {
  USER_AUTH_UI_ATTRIBUTES,
  UserContextData,
} from './authContexts/UserAuthContext';
import { CallAuthFunctions } from './authFunctions/CallAuthFunctions';
import { ProposalAuthFunctions } from './authFunctions/ProposalAuthFunctions';

type AuthFunction<TObj> = (
  user: UserContextData,
  obj: TObj
) => Promise<boolean>;

export type AuthFunctionRegistry<TObj> = Record<string, AuthFunction<TObj>>;

export type AuthContext = {
  type: string;
};

export enum ResourceType {
  USER = 'user',
  CALL = 'call',
  PROPOSAL = 'proposal',
}

type ContextMap = {
  [ResourceType.USER]: UserContextData;
  [ResourceType.CALL]: CallContextData;
  [ResourceType.PROPOSAL]: ProposalContextData;
};

@injectable()
export class AuthRegistry {
  public readonly uiContextAttributes = new Map<ResourceType, string[]>([
    [ResourceType.USER, USER_AUTH_UI_ATTRIBUTES],
    [ResourceType.CALL, CALL_AUTH_UI_ATTRIBUTES],
    [ResourceType.PROPOSAL, PROPOSAL_AUTH_UI_ATTRIBUTES],
  ]);

  public readonly functions: {
    [K in ResourceType]: AuthFunctionRegistry<ContextMap[K]>;
  };

  constructor(
    @inject(Tokens.CallAuthFunctions) callAuthFunctions: CallAuthFunctions,
    @inject(Tokens.ProposalAuthFunctions)
    proposalAuthFunctions: ProposalAuthFunctions
  ) {
    this.functions = {
      [ResourceType.USER]: {},
      [ResourceType.CALL]: callAuthFunctions.registry(),
      [ResourceType.PROPOSAL]: proposalAuthFunctions.registry(),
    };
  }
}

import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import {
  PROPOSAL_AUTH_UI_ATTRIBUTES,
  ProposalContextData,
} from './authContexts/ProposalAuthContext';
import {
  USER_AUTH_UI_ATTRIBUTES,
  UserContextData,
} from './authContexts/UserAuthContext';
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
  PROPOSAL = 'proposal',
}

type ContextMap = {
  [ResourceType.USER]: UserContextData;
  [ResourceType.PROPOSAL]: ProposalContextData;
};

@injectable()
export class AuthRegistry {
  public readonly uiContextAttributes = new Map<ResourceType, string[]>([
    [ResourceType.USER, USER_AUTH_UI_ATTRIBUTES],
    [ResourceType.PROPOSAL, PROPOSAL_AUTH_UI_ATTRIBUTES],
  ]);

  public readonly functions: {
    [K in ResourceType]: AuthFunctionRegistry<ContextMap[K]>;
  } = {
    [ResourceType.USER]: {},
    [ResourceType.PROPOSAL]: {},
  };

  constructor(
    @inject(Tokens.ProposalAuthFunctions)
    proposalAuthFunctions: ProposalAuthFunctions
  ) {
    this.functions[ResourceType.PROPOSAL] = proposalAuthFunctions.registry();
  }
}

import { injectable, inject } from 'tsyringe';

import { CasbinService } from '../casbin/casbinService';
import { Tokens } from '../config/Tokens';
import { UserContextData } from './authContexts/UserAuthContext';

export type EnforcementRequest<TContext = unknown> = [
  user: UserContextData,
  context: TContext,
  action: string,
];

@injectable()
export class CasbinAuthorization {
  constructor(@inject(Tokens.CasbinService) private casbin: CasbinService) {}

  async can(
    user: UserContextData,
    context: unknown,
    action: string
  ): Promise<boolean> {
    return this.casbin.enforce([user, context, action]);
  }

  async canMany(
    user: UserContextData,
    contexts: Map<number, unknown>,
    action: string
  ): Promise<Map<number, boolean>> {
    const contextEntries = Array.from(contexts.entries());
    const enforcementRequests = contextEntries.map(
      ([_, context]) => [user, context, action] as EnforcementRequest
    );

    const results = await this.casbin.batchEnforce(enforcementRequests);

    return new Map(contextEntries.map(([id], index) => [id, results[index]]));
  }
}

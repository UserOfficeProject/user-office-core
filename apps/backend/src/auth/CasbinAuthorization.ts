import { injectable, inject } from 'tsyringe';

import { CasbinService } from '../casbin/casbinService';
import { Tokens } from '../config/Tokens';

export type EnforcementRequest<TContext = unknown> = [
  role: string,
  context: TContext,
  action: string,
];

@injectable()
export class CasbinAuthorization {
  constructor(@inject(Tokens.CasbinService) private casbin: CasbinService) {}

  async can(role: string, context: unknown, action: string): Promise<boolean> {
    return this.casbin.enforce([role, context, action]);
  }

  async canBulk(
    role: string,
    contexts: Map<number, unknown>,
    action: string
  ): Promise<Map<number, boolean>> {
    const contextEntries = Array.from(contexts.entries());
    const enforcementRequests = contextEntries.map(
      ([_, context]) => [role, context, action] as EnforcementRequest
    );

    const results = await this.casbin.batchEnforce(enforcementRequests);

    return new Map(contextEntries.map(([id], index) => [id, results[index]]));
  }
}

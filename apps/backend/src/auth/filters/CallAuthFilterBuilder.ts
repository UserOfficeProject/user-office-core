import { inject, injectable } from 'tsyringe';

import { CasbinService } from '../../casbin/casbinService';
import { walkAst } from '../../casbin/conditionParser';
import { Tokens } from '../../config/Tokens';
import { CallsFilter } from '../../resolvers/queries/CallsQuery';

type CallAuthFilter = Partial<Pick<CallsFilter, 'hasTag'>>;

@injectable()
export class CallAuthFilterBuilder {
  constructor(
    @inject(Tokens.CasbinService)
    private casbinService: CasbinService
  ) {}

  async buildDbFilters(
    sub: string | undefined,
    obj: string,
    act: string
  ): Promise<CallAuthFilter | null> {
    if (!sub) return null;

    const decision = await this.casbinService.getPolicyDecision(sub, obj, act);

    if (decision.type !== 'conditional') {
      return null; // no filters needed in a non-conditional policy
    }

    const conditionJson = await this.casbinService.getPolicyConditionJson(
      decision.conditionId
    );

    if (!conditionJson) return null;

    // TODO: abort filtering when policy contains OR conditions

    const filters: CallAuthFilter = {};

    walkAst(conditionJson, (rule) => {
      if (rule.field === 'call.tag') {
        switch (rule.operator) {
          case '=':
            filters.hasTag = rule.value;
            break;
        }
      }
    });

    return filters;
  }
}

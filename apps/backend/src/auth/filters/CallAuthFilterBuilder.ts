import { inject, injectable } from 'tsyringe';

import { CasbinService } from '../../casbin/casbinService';
import { walkAst } from '../../casbin/conditionParser';
import { Tokens } from '../../config/Tokens';
import { CallsFilter } from '../../resolvers/queries/CallsQuery';

type CallAuthFilter = Partial<Pick<CallsFilter, 'hasTag' | 'isEnded'>>;

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

    const conditionJson = await this.casbinService.getPolicyCondition(
      sub,
      obj,
      act
    );

    if (!conditionJson) return null;

    // TODO: abort filtering when policy contains OR conditions

    const filters: CallAuthFilter = {};

    walkAst(conditionJson, (rule) => {
      const { field, operator, value } = rule;

      switch (field) {
        case 'call.tags':
          if (operator === 'contains') {
            filters.hasTag = value;
          }
          break;

        case 'isCallEnded':
          if (operator === '=' && value === 'true') {
            // Forced example
            filters.isEnded = true;
          }
          break;
      }
    });

    return filters;
  }
}

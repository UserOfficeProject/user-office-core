import { inject, injectable } from 'tsyringe';

import { CasbinService } from '../../casbin/casbinService';
import { walkAst } from '../../casbin/conditionParser';
import { Tokens } from '../../config/Tokens';
import { CallsFilter } from '../../resolvers/queries/CallsQuery';
import { UserContextData } from '../authContexts/UserAuthContext';

type CallAuthFilter = Partial<
  Pick<CallsFilter, 'shortCode' | 'hasTag' | 'isEnded' | 'isEndedInternal'>
>;

@injectable()
export class CallAuthFilters {
  constructor(
    @inject(Tokens.CasbinService)
    private casbinService: CasbinService
  ) {}

  async buildDbFilters(
    user: UserContextData,
    obj: string,
    act: string
  ): Promise<CallAuthFilter | null> {
    if (!user) return null;

    const conditionJson = await this.casbinService.getPolicyCondition(
      user.currentRole,
      obj,
      act
    );

    if (!conditionJson) return null;

    // TODO: abort filtering when policy contains OR conditions

    const filters: CallAuthFilter = {};

    walkAst(conditionJson, (rule) => {
      const { field, operator, value } = rule;

      switch (field) {
        case 'call.shortCode':
          if (operator === '=') {
            filters.shortCode = value;
          }
          break;

        case 'call.tags':
          if (operator === 'contains') {
            filters.hasTag = value;
          }
          break;

        case 'isCallEnded':
          if (operator === '=' && value === 'true') {
            filters.isEnded = true;
          }
          break;

        case 'isCallEndedInternal':
          if (operator === '=' && value === 'true') {
            filters.isEndedInternal = true;
          }
          break;
      }
    });

    return filters;
  }
}

import { inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { StatusDataSource } from '../../datasources/StatusDataSource';
import { WorkflowType } from '../../models/Workflow';
import { UserProposalsFilter } from '../../resolvers/types/User';
import { UserContextData } from '../authContexts/UserAuthContext';
import { CasbinConditionEvaluator } from '../casbin/CasbinConditionEvaluator';
import { CasbinService } from '../casbin/CasbinService';

type UserProposalsAuthFilter = Partial<
  Pick<UserProposalsFilter, 'proposalStatusId' | 'managementDecisionSubmitted'>
>;

@injectable()
export class ProposalAuthFilters {
  constructor(
    @inject(Tokens.CasbinService)
    private casbinService: CasbinService,
    @inject(Tokens.StatusDataSource)
    private statusDataSource: StatusDataSource,
    @inject(Tokens.CasbinConditionEvaluator)
    private conditionEvaluator: CasbinConditionEvaluator
  ) {}

  async buildUserProposalsDbFilter(
    user: UserContextData,
    obj: string,
    act: string
  ): Promise<UserProposalsAuthFilter | null> {
    if (!user.currentRole) return null;

    const conditionJson = await this.casbinService.getPolicyCondition(
      user.currentRole,
      obj,
      act
    );

    if (
      !conditionJson ||
      this.conditionEvaluator.hasOrCombinator(conditionJson)
    ) {
      return null;
    }

    const filters: UserProposalsAuthFilter = {};

    await this.conditionEvaluator.walkAst(conditionJson, async (rule: any) => {
      const { field, operator, value } = rule;

      switch (field) {
        case 'proposal.statusShortCode':
          if (operator === '=') {
            const statuses = await this.statusDataSource.getAllStatuses(
              WorkflowType.PROPOSAL
            );
            const statusId = statuses.find(
              (status) => status.shortCode === value
            )?.id;
            filters.proposalStatusId = statusId;
          }
          break;

        case 'proposal.managementDecisionSubmitted':
          if (operator === '=' && value === 'true') {
            filters.managementDecisionSubmitted = true;
          }
          break;
      }
    });

    return filters;
  }
}

import { inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { StatusDataSource } from '../../datasources/StatusDataSource';
import { WorkflowType } from '../../models/Workflow';
import { ProposalsFilter } from '../../resolvers/queries/ProposalsQuery';
import { UserContextData } from '../authContexts/UserAuthContext';
import { CasbinService } from '../casbin/casbinService';
import { walkAst } from '../casbin/conditionParser';

type ProposalAuthFilter = Partial<
  Pick<ProposalsFilter, 'text' | 'proposalStatusId'>
>;

@injectable()
export class ProposalAuthFilters {
  constructor(
    @inject(Tokens.CasbinService)
    private casbinService: CasbinService,
    @inject(Tokens.StatusDataSource)
    private statusDataSource: StatusDataSource
  ) {}

  async buildDbFilters(
    user: UserContextData,
    obj: string,
    act: string
  ): Promise<ProposalAuthFilter | null> {
    if (!user.currentRole) return null;

    const conditionJson = await this.casbinService.getPolicyCondition(
      user.currentRole,
      obj,
      act
    );

    if (!conditionJson) return null;

    // TODO: abort filtering when policy contains OR conditions

    const filters: ProposalAuthFilter = {};

    walkAst(conditionJson, async (rule) => {
      const { field, operator, value } = rule;

      switch (field) {
        case 'proposal.title':
          if (operator === '=') {
            filters.text = value;
          }
          break;

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
      }
    });

    return filters;
  }
}

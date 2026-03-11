import DataLoader from 'dataloader';
import { inject, injectable } from 'tsyringe';

import {
  ProposalAuthContext,
  ProposalContextData,
} from '../auth/authContexts/ProposalAuthContext';
import { UserAuthContext } from '../auth/authContexts/UserAuthContext';
import { CasbinService } from '../auth/casbin/CasbinService';
import { EnforcementRequest } from '../auth/CasbinAuthorization';
import { Tokens } from '../config/Tokens';
import { UserWithRole } from '../models/User';
import {
  PROPOSAL_ACTIONS,
  ProposalUiPermissions,
} from '../resolvers/types/ProposalUiPermissions';

export function createEmptyProposalUiPermissions(): ProposalUiPermissions {
  return {
    canDelete: false,
    canUpdate: false,
  };
}

@injectable()
export default class ProposalPermissionsLoader {
  constructor(
    @inject(Tokens.UserAuthContext)
    private userAuthContext: UserAuthContext,
    @inject(Tokens.ProposalAuthContext)
    private authContext: ProposalAuthContext,
    @inject(Tokens.CasbinService) private casbinService: CasbinService
  ) {}

  createLoader(
    user: UserWithRole | null
  ): DataLoader<number, ProposalUiPermissions> {
    return new DataLoader(
      async (proposalPks: readonly number[]) => {
        const userCtx = await this.userAuthContext.toContextData(user);

        if (!userCtx) {
          return proposalPks.map(() => createEmptyProposalUiPermissions());
        }

        const uniqueProposalPks = [...new Set(proposalPks.map(Number))];

        const contextMap =
          await this.authContext.fetchProposalsContext(uniqueProposalPks);

        const actions = Object.entries(PROPOSAL_ACTIONS);
        const enforcementRequests: EnforcementRequest<ProposalContextData>[] =
          [];

        for (const proposalPk of uniqueProposalPks) {
          const proposalCtx = contextMap.get(proposalPk);
          if (!proposalCtx) continue;

          for (const [_, action] of actions) {
            enforcementRequests.push([userCtx, proposalCtx, action]);
          }
        }

        const results =
          await this.casbinService.batchEnforce(enforcementRequests);

        const permissionsMap = new Map<number, ProposalUiPermissions>();

        uniqueProposalPks.forEach((proposalPk, proposalIndex) => {
          const baseIndex = proposalIndex * actions.length;
          permissionsMap.set(proposalPk, {
            canDelete: results[baseIndex],
            canUpdate: results[baseIndex + 1],
          });
        });

        return uniqueProposalPks.map(
          (proposalPk) =>
            permissionsMap.get(proposalPk) || createEmptyProposalUiPermissions()
        );
      },
      {
        cacheKeyFn: (proposalPk) => proposalPk.toString(),
      }
    );
  }
}

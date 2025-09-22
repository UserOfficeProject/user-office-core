import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { UserWithRole } from '../models/User';
import { Proposal } from '../resolvers/types/Proposal';
import { ProposalAuthorization } from './ProposalAuthorization';
import { UserAuthorization } from './UserAuthorization';

@injectable()
export class DataAccessUsersAuthorization {
  constructor(
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.UserAuthorization) protected userAuth: UserAuthorization,
    @inject(Tokens.ProposalAuthorization)
    protected proposalAuth: ProposalAuthorization
  ) {}

  private async resolveProposal(
    proposalOrProposalId: Proposal | number
  ): Promise<Proposal | null> {
    let proposal;

    if (typeof proposalOrProposalId === 'number') {
      proposal = await this.proposalDataSource.get(proposalOrProposalId);
    } else {
      proposal = proposalOrProposalId;
    }

    return proposal;
  }

  public async hasWriteRights(
    agent: UserWithRole | null,
    proposalOrProposalId: Proposal | number
  ): Promise<boolean> {
    if (agent == null) {
      return false;
    }

    const proposal = await this.resolveProposal(proposalOrProposalId);
    if (proposal == null) {
      return false;
    }
    const hasAccess =
      this.userAuth.isUserOfficer(agent) ||
      this.proposalAuth.isMemberOfProposal(agent, proposal);

    return hasAccess;
  }
}

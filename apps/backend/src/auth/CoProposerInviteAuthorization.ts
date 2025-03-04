import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { UserWithRole } from '../models/User';
import { ProposalAuthorization } from './ProposalAuthorization';
import { UserAuthorization } from './UserAuthorization';

@injectable()
export class CoProposerInviteAuthorization {
  constructor(
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization,
    @inject(Tokens.ProposalAuthorization)
    private proposalAuth: ProposalAuthorization
  ) {}

  public async hasReadRights(agent: UserWithRole | null, proposalPk: number) {
    const isUserOfficer = await this.userAuth.isUserOfficer(agent);
    const isMemberOfProposal = await this.proposalAuth.isMemberOfProposal(
      agent,
      proposalPk
    );

    return isUserOfficer || isMemberOfProposal;
  }

  public async hasWriteRights(agent: UserWithRole | null, proposalPk: number) {
    const isUserOfficer = await this.userAuth.isUserOfficer(agent);
    const hasProposalWriteRights = await this.proposalAuth.hasWriteRights(
      agent,
      proposalPk
    );

    return isUserOfficer || hasProposalWriteRights;
  }
}

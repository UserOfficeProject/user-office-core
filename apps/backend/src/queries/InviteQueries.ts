import { inject, injectable } from 'tsyringe';

import { ProposalAuthorization } from '../auth/ProposalAuthorization';
import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { CoProposerClaimDataSource } from '../datasources/CoProposerClaimDataSource';
import { InviteDataSource } from '../datasources/InviteDataSource';
import { Authorized } from '../decorators';
import { Invite } from '../models/Invite';
import { rejection } from '../models/Rejection';
import { UserWithRole } from '../models/User';

@injectable()
export default class InviteQueries {
  constructor(
    @inject(Tokens.CoProposerClaimDataSource)
    public coProposerClaimDataSource: CoProposerClaimDataSource,
    @inject(Tokens.InviteDataSource)
    public inviteDataSource: InviteDataSource,
    @inject(Tokens.UserAuthorization)
    private userAuth: UserAuthorization,
    @inject(Tokens.ProposalAuthorization)
    private proposalAuth: ProposalAuthorization
  ) {}

  @Authorized()
  async getCoProposerInvites(agent: UserWithRole | null, proposalPk: number) {
    const isUserOfficer = await this.userAuth.isUserOfficer(agent);
    const isMemberOfProposal = await this.proposalAuth.isMemberOfProposal(
      agent,
      proposalPk
    );

    if (!isUserOfficer && !isMemberOfProposal) {
      return rejection('User is not authorized to view these invites');
    }

    const coProposerClaims =
      await this.coProposerClaimDataSource.getByProposalPk(proposalPk);
    const invites = await Promise.all(
      coProposerClaims.map(async (claim) => {
        const invite = await this.inviteDataSource.findById(claim.inviteId);

        return invite as Invite;
      })
    );

    return invites;
  }
}

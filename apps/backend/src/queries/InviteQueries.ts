import { inject, injectable } from 'tsyringe';

import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { CoProposerClaimDataSource } from '../datasources/CoProposerClaimDataSource';
import { InviteDataSource } from '../datasources/InviteDataSource';
import { Authorized } from '../decorators';
import { Invite } from '../models/Invite';
import { UserWithRole } from '../models/User';

@injectable()
export default class InviteQueries {
  constructor(
    @inject(Tokens.CoProposerClaimDataSource)
    public coProposerClaimDataSource: CoProposerClaimDataSource,
    @inject(Tokens.InviteDataSource)
    public inviteDataSource: InviteDataSource,
    @inject(Tokens.UserAuthorization)
    private userAuth: UserAuthorization
  ) {}

  @Authorized()
  async getCoProposerInvites(agent: UserWithRole | null, proposalPk: number) {
    // TODO implement authorization
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

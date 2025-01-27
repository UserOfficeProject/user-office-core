import { inject, injectable } from 'tsyringe';

import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { CoProposerInviteDataSource } from '../datasources/CoProposerInviteDataSource';
import { InviteCodeDataSource } from '../datasources/InviteCodeDataSource';
import { Authorized } from '../decorators';
import { InviteCode } from '../models/InviteCode';
import { UserWithRole } from '../models/User';

@injectable()
export default class InviteQueries {
  constructor(
    @inject(Tokens.CoProposerInviteDataSource)
    public coProposerDataSource: CoProposerInviteDataSource,
    @inject(Tokens.InviteCodeDataSource)
    public inviteDataSource: InviteCodeDataSource,
    @inject(Tokens.UserAuthorization)
    private userAuth: UserAuthorization
  ) {}

  @Authorized()
  async getCoProposerInvites(agent: UserWithRole | null, proposalPk: number) {
    // TODO implement authorization
    const proposalCoProposerClaims =
      await this.coProposerDataSource.findByProposalPk(proposalPk);
    const invites = await Promise.all(
      proposalCoProposerClaims.map(async (claim) => {
        const invite = await this.inviteDataSource.findById(claim.inviteCodeId);

        return invite as InviteCode;
      })
    );

    return invites;
  }
}

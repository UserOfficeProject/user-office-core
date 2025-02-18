import { inject, injectable } from 'tsyringe';

import { InviteAuthorization } from '../auth/InviteAuthorizer';
import { Tokens } from '../config/Tokens';
import { CoProposerClaimDataSource } from '../datasources/CoProposerClaimDataSource';
import { InviteDataSource } from '../datasources/InviteDataSource';
import { Authorized } from '../decorators';
import { UserWithRole } from '../models/User';

@injectable()
export default class InviteQueries {
  constructor(
    @inject(Tokens.CoProposerClaimDataSource)
    public coProposerClaimDataSource: CoProposerClaimDataSource,
    @inject(Tokens.InviteDataSource)
    public dataSource: InviteDataSource,
    @inject(Tokens.InviteAuthorization)
    private inviteAuth: InviteAuthorization
  ) {}

  @Authorized()
  async getCoProposerInvites(agent: UserWithRole | null, proposalPk: number) {
    const hasReadRights = this.inviteAuth.hasReadRights(agent, proposalPk);

    if (!hasReadRights) {
      return [];
    }

    const invites = await this.dataSource.findCoProposerInvites(
      proposalPk,
      false
    );

    return invites;
  }
}

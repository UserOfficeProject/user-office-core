import { inject, injectable } from 'tsyringe';

import { ProposalAuthorization } from '../auth/ProposalAuthorization';
import { UserAuthorization } from '../auth/UserAuthorization';
import { VisitAuthorization } from '../auth/VisitAuthorization';
import { Tokens } from '../config/Tokens';
import { InviteDataSource } from '../datasources/InviteDataSource';
import { Authorized } from '../decorators';
import { UserWithRole } from '../models/User';

@injectable()
export default class InviteQueries {
  constructor(
    @inject(Tokens.InviteDataSource)
    public dataSource: InviteDataSource,
    @inject(Tokens.ProposalAuthorization)
    private proposalAuth: ProposalAuthorization,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization,
    @inject(Tokens.VisitAuthorization) private visitAuth: VisitAuthorization
  ) {}

  @Authorized()
  async getCoProposerInvites(agent: UserWithRole | null, proposalPk: number) {
    const hasReadRights =
      this.userAuth.isApiToken(agent) ||
      (await this.proposalAuth.hasReadRights(agent, proposalPk));

    if (!hasReadRights) {
      return [];
    }

    const invites =
      await this.dataSource.findPendingCoProposerInvites(proposalPk);

    return invites;
  }

  @Authorized()
  async getDataAccessInvites(agent: UserWithRole | null, proposalPk: number) {
    const hasReadRights =
      this.userAuth.isApiToken(agent) ||
      (await this.proposalAuth.hasReadRights(agent, proposalPk));

    if (!hasReadRights) {
      return [];
    }

    const invites =
      await this.dataSource.findPendingDataAccessInvites(proposalPk);

    return invites;
  }

  @Authorized()
  async getVisitRegistrationInvites(
    agent: UserWithRole | null,
    visitId: number
  ) {
    const hasReadRights =
      this.userAuth.isApiToken(agent) ||
      (await this.visitAuth.hasReadRights(agent, visitId));

    if (!hasReadRights) {
      return [];
    }

    const invites = await this.dataSource.findVisitRegistrationInvites(
      visitId,
      false
    );

    return invites;
  }

  @Authorized()
  async getPendingCoProposerInvites(agent: UserWithRole | null) {
    if (!agent) {
      return [];
    }

    const invites = await this.dataSource.getCoProposerInvites({
      email: agent.email,
      isClaimed: false,
      isExpired: false,
    });

    return invites;
  }

  @Authorized()
  async getPendingDataAccessInvites(agent: UserWithRole | null) {
    if (!agent) {
      return [];
    }

    const invites = await this.dataSource.getDataAccessInvites({
      email: agent.email,
      isClaimed: false,
      isExpired: false,
    });

    return invites;
  }
}

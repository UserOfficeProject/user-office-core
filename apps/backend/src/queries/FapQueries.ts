import { inject, injectable } from 'tsyringe';

import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { FapDataSource } from '../datasources/FapDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { FapsFilter } from '../resolvers/queries/FapsQuery';

@injectable()
export default class FapQueries {
  constructor(
    @inject(Tokens.FapDataSource) public dataSource: FapDataSource,
    @inject(Tokens.ProposalDataSource)
    public proposalDataSource: ProposalDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
  ) {}

  @Authorized([
    Roles.USER_OFFICER,
    Roles.FAP_CHAIR,
    Roles.FAP_SECRETARY,
    Roles.FAP_REVIEWER,
  ])
  async get(agent: UserWithRole | null, id: number) {
    const fap = await this.dataSource.getFap(id);

    if (!fap) {
      return null;
    }

    if (
      this.userAuth.isUserOfficer(agent) ||
      (await this.userAuth.isMemberOfFap(agent, id))
    ) {
      return fap;
    } else {
      return null;
    }
  }

  @Authorized([Roles.USER_OFFICER])
  async getAll(agent: UserWithRole | null, filter?: FapsFilter) {
    return this.dataSource.getFaps(filter);
  }

  @Authorized([Roles.USER_OFFICER, Roles.FAP_CHAIR, Roles.FAP_SECRETARY])
  async getMembers(agent: UserWithRole | null, fapId: number) {
    return this.dataSource.getMembers(fapId);
  }

  @Authorized([Roles.USER_OFFICER, Roles.FAP_CHAIR, Roles.FAP_SECRETARY])
  async getReviewers(agent: UserWithRole | null, fapId: number) {
    return this.dataSource.getReviewers(fapId);
  }

  @Authorized([
    Roles.USER_OFFICER,
    Roles.FAP_CHAIR,
    Roles.FAP_SECRETARY,
    Roles.FAP_REVIEWER,
  ])
  async getFapProposals(
    agent: UserWithRole | null,
    {
      fapId,
      callId,
      instrumentId,
    }: { fapId: number; callId: number | null; instrumentId: number | null }
  ) {
    if (
      agent?.isApiAccessToken ||
      this.userAuth.isUserOfficer(agent) ||
      (await this.userAuth.isMemberOfFap(agent, fapId))
    ) {
      return this.dataSource.getFapProposals({ fapId, callId, instrumentId });
    } else {
      return null;
    }
  }

  @Authorized([
    Roles.USER_OFFICER,
    Roles.FAP_CHAIR,
    Roles.FAP_SECRETARY,
    Roles.FAP_REVIEWER,
  ])
  async getFapProposal(
    agent: UserWithRole | null,
    { fapId, proposalPk }: { fapId: number; proposalPk: number }
  ) {
    if (
      this.userAuth.isUserOfficer(agent) ||
      (await this.userAuth.isMemberOfFap(agent, fapId))
    ) {
      return this.dataSource.getFapProposal(fapId, proposalPk);
    } else {
      return null;
    }
  }

  @Authorized([
    Roles.USER_OFFICER,
    Roles.FAP_CHAIR,
    Roles.FAP_SECRETARY,
    Roles.FAP_REVIEWER,
  ])
  async getFapProposalsByInstrument(
    agent: UserWithRole | null,
    {
      fapId,
      instrumentId,
      callId,
    }: { fapId: number; instrumentId: number; callId: number }
  ) {
    if (
      this.userAuth.isUserOfficer(agent) ||
      (await this.userAuth.isMemberOfFap(agent, fapId))
    ) {
      return this.dataSource.getFapProposalsByInstrument(instrumentId, callId, {
        fapId,
      });
    } else {
      return null;
    }
  }

  @Authorized([
    Roles.USER_OFFICER,
    Roles.FAP_CHAIR,
    Roles.FAP_SECRETARY,
    Roles.FAP_REVIEWER,
  ])
  async getFapProposalAssignments(
    agent: UserWithRole | null,
    {
      fapId,
      proposalPk,
    }: {
      fapId: number;
      proposalPk: number;
    }
  ) {
    let reviewerId = null;

    const proposalEvents =
      await this.proposalDataSource.getProposalEvents(proposalPk);

    // NOTE: If not officer, Fap Chair or Fap Secretary should return all proposal assignments only if everything is submitted. Otherwise for Fap Reviewer return only it's own proposal reviews.
    if (
      agent &&
      !this.userAuth.isUserOfficer(agent) &&
      !(await this.userAuth.isChairOrSecretaryOfFap(agent, fapId)) &&
      !proposalEvents?.proposal_all_fap_reviews_submitted
    ) {
      reviewerId = agent.id;
    }

    return this.dataSource.getFapProposalAssignments(
      fapId,
      proposalPk,
      reviewerId
    );
  }

  @Authorized([Roles.USER_OFFICER, Roles.FAP_CHAIR, Roles.FAP_SECRETARY])
  async getProposalFapMeetingDecisions(
    agent: UserWithRole | null,
    { proposalPk, fapId }: { proposalPk: number; fapId?: number }
  ) {
    const fapMeetingDecisions =
      await this.dataSource.getProposalsFapMeetingDecisions(
        [proposalPk],
        fapId
      );
    const fap = await this.dataSource.getFapByProposalPk(proposalPk);

    if (!fapMeetingDecisions.length || !fap) {
      return [];
    }

    if (
      this.userAuth.isUserOfficer(agent) ||
      (await this.userAuth.isMemberOfFap(agent, fap.id))
    ) {
      return fapMeetingDecisions;
    } else {
      return [];
    }
  }

  async getProposalsFaps(agent: UserWithRole | null, proposalPks: number[]) {
    return await this.dataSource.getFapsByProposalPks(proposalPks);
  }
}

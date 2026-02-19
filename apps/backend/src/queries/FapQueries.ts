import { inject, injectable } from 'tsyringe';

import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { FapDataSource } from '../datasources/FapDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { Authorized } from '../decorators';
import { ReviewStatus } from '../models/Review';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { FapsFilter } from '../resolvers/queries/FapsQuery';

@injectable()
export default class FapQueries {
  constructor(
    @inject(Tokens.FapDataSource) public dataSource: FapDataSource,
    @inject(Tokens.ProposalDataSource)
    public proposalDataSource: ProposalDataSource,
    @inject(Tokens.ReviewDataSource)
    private reviewDataSource: ReviewDataSource,
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
      this.userAuth.isApiToken(agent) ||
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
      legacy,
    }: {
      fapId: number;
      callId: number | null;
      instrumentId: number | null;
      legacy: boolean;
    }
  ) {
    if (
      this.userAuth.isApiToken(agent) ||
      this.userAuth.isUserOfficer(agent) ||
      (await this.userAuth.isMemberOfFap(agent, fapId))
    ) {
      const fapProposals = legacy
        ? await this.dataSource.getLegacyFapProposals({
            fapId,
            callId,
            instrumentId,
          })
        : await this.dataSource.getFapProposals({
            fapId,
            callId,
            instrumentId,
          });

      // Remove users proposals from the list if the user is a FAP Reviewer
      // This ensures that Reviewers cannot see reviews of there own proposals
      // which might contain sensitive information
      if (agent?.currentRole?.shortCode === Roles.FAP_REVIEWER) {
        const usersProposals = (
          await this.proposalDataSource.getUserProposals(agent.id)
        ).map((p) => p.primaryKey);

        return fapProposals.filter(
          (fp) => !usersProposals.includes(fp.proposalPk)
        );
      }

      return fapProposals;
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
      this.userAuth.isApiToken(agent) ||
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
      this.userAuth.isApiToken(agent) ||
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
    if (!agent) {
      return null;
    }

    const isApiToken = this.userAuth.isApiToken(agent);
    const isUserOfficer = this.userAuth.isUserOfficer(agent);
    const isChairOrSecretary = await this.userAuth.isChairOrSecretaryOfFap(
      agent,
      fapId
    );
    const isFapMember = await this.userAuth.isMemberOfFap(agent, fapId);

    if (!isApiToken && !isUserOfficer && !isFapMember) {
      return null;
    }

    let reviewerId: number | null = null;
    const canSeeAllAssignments =
      isApiToken || isUserOfficer || isChairOrSecretary;

    if (!canSeeAllAssignments) {
      const reviews = await this.reviewDataSource.getProposalReviews(
        proposalPk,
        fapId
      );
      const allReviewsSubmitted =
        reviews.length > 0 &&
        reviews.every((review) => review.status === ReviewStatus.SUBMITTED);

      if (!allReviewsSubmitted && agent.id) {
        reviewerId = agent.id;
      }
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
      this.userAuth.isApiToken(agent) ||
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

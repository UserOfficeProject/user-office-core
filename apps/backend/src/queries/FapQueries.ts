import { DateTime } from 'luxon';
import { inject, injectable } from 'tsyringe';

import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { CallDataSource } from '../datasources/CallDataSource';
import { FapDataSource } from '../datasources/FapDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { Authorized } from '../decorators';
import { Call } from '../models/Call';
import { Fap, FapReviewVisibility } from '../models/Fap';
import { ReviewStatus } from '../models/Review';
import { ProposalReaderRoleConfig, Roles } from '../models/Role';
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
    @inject(Tokens.CallDataSource) private callDataSource: CallDataSource,
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

    return (await this.userHasFapAccess(agent, id)) ? fap : null;
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
        ).userProposals.map((p) => p.primaryKey);

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
    return (await this.userHasFapAccess(agent, fapId))
      ? this.dataSource.getFapProposal(fapId, proposalPk)
      : null;
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
    return (await this.userHasFapAccess(agent, fapId))
      ? this.dataSource.getFapProposalsByInstrument(instrumentId, callId, {
          fapId,
        })
      : null;
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
    const proposal = await this.proposalDataSource.get(proposalPk);
    if (!proposal) {
      return null;
    }

    const call = await this.callDataSource.getCall(proposal.callId);
    if (!call) {
      return null;
    }

    const isApiToken = this.userAuth.isApiToken(agent);
    const isUserOfficer = this.userAuth.isUserOfficer(agent);
    const isChairOrSecretary = await this.userAuth.isChairOrSecretaryOfFap(
      agent,
      fapId
    );

    if (isUserOfficer || isChairOrSecretary) {
      // Applying no restrictions for user officers, fap chairs and fap secretaries
      return this.dataSource.getFapProposalAssignments(fapId, proposalPk, null);
    }

    const visibility = await this.dataSource.getFapReviewVisibility(fapId);
    let fapAccessRestrictions = true;

    switch (visibility) {
      case FapReviewVisibility.PROPOSAL_REVIEWS_COMPLETE:
        const canSeeAllAssignments =
          isApiToken ||
          isUserOfficer ||
          isChairOrSecretary ||
          (await this.allFapReviewsComplete(fapId, proposalPk));

        if (canSeeAllAssignments) fapAccessRestrictions = false;
        break;
      case FapReviewVisibility.REVIEWS_VISIBLE_FAP_ENDED:
        const hasFapEnded = this.hasFapEnded(call);
        if (hasFapEnded) fapAccessRestrictions = false;
        break;
      case FapReviewVisibility.REVIEWS_VISIBLE:
        fapAccessRestrictions = false;
        break;
    }

    return this.dataSource.getFapProposalAssignments(
      fapId,
      proposalPk,
      fapAccessRestrictions ? agent!.id : null
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

    if (!fapMeetingDecisions.length) {
      return [];
    }

    const fap = await this.dataSource.getFapByProposalPk(proposalPk);
    if (!fap) {
      return [];
    }

    return (await this.userHasFapAccess(agent, fap.id))
      ? fapMeetingDecisions
      : [];
  }

  async getProposalsFaps(agent: UserWithRole | null, proposalPks: number[]) {
    return await this.dataSource.getFapsByProposalPks(proposalPks);
  }

  @Authorized([Roles.USER_OFFICER])
  async getFapReviewVisibilityOptions(agent: UserWithRole | null) {
    return await this.dataSource.getFapReviewVisibilityOptions();
  }

  @Authorized()
  async getFapsByProposalPk(
    agent: UserWithRole | null,
    proposalPk: number
  ): Promise<Fap[]> {
    if (agent?.currentRole?.shortCode === Roles.PROPOSAL_READER) {
      const hasFapAccess = (
        agent.currentRole.config as ProposalReaderRoleConfig
      ).hasFapAccess;
      if (!hasFapAccess) {
        return [];
      }
    }

    return this.dataSource.getFapsByProposalPk(proposalPk);
  }

  private async userHasFapAccess(
    agent: UserWithRole | null,
    fapId: number
  ): Promise<boolean> {
    return (
      this.userAuth.isApiToken(agent) ||
      this.userAuth.isUserOfficer(agent) ||
      (await this.userAuth.isMemberOfFap(agent, fapId))
    );
  }

  private async allFapReviewsComplete(fapId: number, proposalPk: number) {
    const reviews = await this.reviewDataSource.getProposalReviews(
      proposalPk,
      fapId
    );

    return (
      reviews.length > 0 &&
      reviews.every((review) => review.status === ReviewStatus.SUBMITTED)
    );
  }

  private hasFapEnded(call: Call) {
    const currentDate = DateTime.now();

    return call.endFapReview?.getTime() <= currentDate.toMillis();
  }
}

import { container, inject, injectable } from 'tsyringe';

import { ReviewAuthorization } from '../auth/ReviewAuthorization';
import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { Authorized } from '../decorators';
import { Review } from '../models/Review';
import { ProposalReaderRolePermissions, Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { ReviewsFilter } from '../resolvers/queries/ReviewsQuery';

type ReviewsForProposalArgs = {
  proposalPk: number;
  fapId?: number;
};

@injectable()
export default class ReviewQueries {
  private reviewAuth = container.resolve(ReviewAuthorization);

  constructor(
    @inject(Tokens.ReviewDataSource) public dataSource: ReviewDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
  ) {}

  @Authorized()
  async get(
    agent: UserWithRole | null,
    { reviewId }: { reviewId: number }
  ): Promise<Review | null> {
    const review = await this.dataSource.getReview(reviewId);
    if (!review) {
      return null;
    }

    if (
      this.userAuth.isApiToken(agent) ||
      (await this.reviewAuth.hasReadRights(agent, review))
    ) {
      return review;
    } else {
      return null;
    }
  }

  @Authorized([Roles.USER_OFFICER, Roles.FAP_CHAIR, Roles.FAP_SECRETARY])
  async getAll(
    agent: UserWithRole | null,
    filter?: ReviewsFilter,
    first?: number,
    offset?: number
  ) {
    return this.dataSource.getReviews(filter, first, offset);
  }

  @Authorized([
    Roles.USER_OFFICER,
    Roles.FAP_CHAIR,
    Roles.FAP_SECRETARY,
    Roles.PROPOSAL_READER,
  ])
  async reviewsForProposal(
    agent: UserWithRole | null,
    { proposalPk, fapId }: ReviewsForProposalArgs
  ): Promise<Review[] | null> {
    if (agent!.currentRole?.shortCode === Roles.PROPOSAL_READER) {
      const hasReviewAccess = (
        agent!.currentRole.config as ProposalReaderRolePermissions
      ).hasTechnicalReviewAccess;
      if (!hasReviewAccess) {
        return null;
      }
    }

    const reviews = await this.dataSource.getProposalReviews(proposalPk, fapId);

    const permittedReviews = reviews.filter(
      async (review) =>
        this.userAuth.isApiToken(agent) ||
        (await this.reviewAuth.hasReadRights(agent, review))
    );

    return permittedReviews;
  }
}

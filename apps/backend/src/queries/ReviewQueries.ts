import { container, inject, injectable } from 'tsyringe';

import { ProposalAuthorization } from '../auth/ProposalAuthorization';
import { ReviewAuthorization } from '../auth/ReviewAuthorization';
import { TechnicalReviewAuthorization } from '../auth/TechnicalReviewAuthorization';
import { Tokens } from '../config/Tokens';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { Authorized } from '../decorators';
import { Review } from '../models/Review';
import { Roles } from '../models/Role';
import { TechnicalReview } from '../models/TechnicalReview';
import { UserWithRole } from '../models/User';

@injectable()
export default class ReviewQueries {
  private proposalAuth = container.resolve(ProposalAuthorization);
  private reviewAuth = container.resolve(ReviewAuthorization);
  private technicalReviewAuth = container.resolve(TechnicalReviewAuthorization);

  constructor(
    @inject(Tokens.ReviewDataSource) public dataSource: ReviewDataSource
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

    if (await this.reviewAuth.hasReadRights(agent, review)) {
      return review;
    } else {
      return null;
    }
  }

  @Authorized([Roles.USER_OFFICER, Roles.FAP_CHAIR, Roles.FAP_SECRETARY])
  async reviewsForProposal(
    agent: UserWithRole | null,
    {
      proposalPk,
      fapId,
    }: {
      proposalPk: number;
      fapId?: number;
    }
  ): Promise<Review[] | null> {
    const reviews = await this.dataSource.getProposalReviews(proposalPk, fapId);

    const permittedReviews = reviews.filter(
      async (review) => await this.reviewAuth.hasReadRights(agent, review)
    );

    return permittedReviews;
  }

  @Authorized()
  async technicalReviewsForProposal(
    agent: UserWithRole | null,
    proposalPk: number
  ): Promise<TechnicalReview[]> {
    const technicalReviews =
      await this.dataSource.getTechnicalReviews(proposalPk);

    if (!technicalReviews) {
      return [];
    }

    // NOTE: We only return the tehcnical reviews that the user has rights to see.
    await Promise.all(
      technicalReviews.map(async (tehcnicalReview, index) => {
        const hasReadRights = await this.technicalReviewAuth.hasReadRights(
          agent,
          tehcnicalReview
        );

        if (!hasReadRights) {
          technicalReviews.splice(index, 1);
        }
      })
    );

    const isReviewerOfProposal = await this.proposalAuth.isReviewerOfProposal(
      agent,
      proposalPk
    );
    if (isReviewerOfProposal) {
      technicalReviews.forEach((technicalReview) => {
        technicalReview.comment = '';
      });
    }

    return technicalReviews;
  }
}

import { container, inject, injectable } from 'tsyringe';

import { ProposalAuthorization } from '../auth/ProposalAuthorization';
import { TechnicalReviewAuthorization } from '../auth/TechnicalReviewAuthorization';
import { Tokens } from '../config/Tokens';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { TechnicalReview } from '../models/TechnicalReview';
import { UserWithRole } from '../models/User';
import { TechnicalReviewsFilter } from '../resolvers/queries/TechnicalReviewsQuery';

@injectable()
export default class TechnicalReviewQueries {
  private proposalAuth = container.resolve(ProposalAuthorization);
  private technicalReviewAuth = container.resolve(TechnicalReviewAuthorization);

  constructor(
    @inject(Tokens.ReviewDataSource) public dataSource: ReviewDataSource
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async getAll(
    agent: UserWithRole | null,
    filter?: TechnicalReviewsFilter,
    first?: number,
    offset?: number
  ) {
    return this.dataSource.getTechnicalReviewsByFilter(filter, first, offset);
  }

  @Authorized()
  async reviewsForProposal(
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

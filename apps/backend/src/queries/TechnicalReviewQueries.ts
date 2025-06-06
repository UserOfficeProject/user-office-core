import { container, inject, injectable } from 'tsyringe';

import { ProposalAuthorization } from '../auth/ProposalAuthorization';
import { TechnicalReviewAuthorization } from '../auth/TechnicalReviewAuthorization';
import { UserAuthorization } from '../auth/UserAuthorization';
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
    @inject(Tokens.ReviewDataSource) public dataSource: ReviewDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
  ) {}

  @Authorized()
  async get(
    agent: UserWithRole | null,
    { technicalReviewId }: { technicalReviewId: number }
  ): Promise<TechnicalReview | null> {
    const technicalReview =
      await this.dataSource.getTechnicalReviewById(technicalReviewId);
    if (!technicalReview) {
      return null;
    }

    if (
      this.userAuth.isApiToken(agent) ||
      (await this.technicalReviewAuth.hasReadRights(agent, technicalReview))
    ) {
      return technicalReview;
    } else {
      return null;
    }
  }

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

    // NOTE: We only return the technical reviews that the user has rights to see.
    await Promise.all(
      technicalReviews.map(async (technicalReview, index) => {
        const hasReadRights =
          this.userAuth.isApiToken(agent) ||
          (await this.technicalReviewAuth.hasReadRights(
            agent,
            technicalReview
          ));

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

import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { Authorized } from '../decorators';
import { Review } from '../models/Review';
import { Roles } from '../models/Role';
import { TechnicalReview } from '../models/TechnicalReview';
import { UserWithRole } from '../models/User';
import { UserAuthorization } from '../utils/UserAuthorization';

@injectable()
export default class ReviewQueries {
  constructor(
    @inject(Tokens.ReviewDataSource) public dataSource: ReviewDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
  ) {}

  @Authorized()
  async get(
    agent: UserWithRole | null,
    { reviewId, sepId }: { reviewId: number; sepId?: number | null }
  ): Promise<Review | null> {
    const review = await this.dataSource.get(reviewId);
    if (!review) {
      return null;
    }

    if (
      review.userID === agent!.id ||
      this.userAuth.isUserOfficer(agent) ||
      (sepId && (await this.userAuth.isChairOrSecretaryOfSEP(agent, sepId)))
    ) {
      return this.dataSource.get(reviewId);
    } else {
      return null;
    }
  }

  @Authorized([Roles.USER_OFFICER, Roles.SEP_CHAIR, Roles.SEP_SECRETARY])
  async reviewsForProposal(
    agent: UserWithRole | null,
    proposalId: number
  ): Promise<Review[] | null> {
    if (
      !this.userAuth.isUserOfficer(agent) &&
      !(await this.userAuth.isChairOrSecretaryOfProposal(agent, proposalId))
    ) {
      return null;
    }

    return this.dataSource.getProposalReviews(proposalId);
  }

  @Authorized()
  async technicalReviewForProposal(
    agent: UserWithRole | null,
    proposalID: number
  ): Promise<TechnicalReview | null> {
    if (
      this.userAuth.isUserOfficer(agent) ||
      (await this.userAuth.isScientistToProposal(agent, proposalID)) ||
      (await this.userAuth.isChairOrSecretaryOfProposal(agent, proposalID))
    ) {
      return this.dataSource.getTechnicalReview(proposalID);
    } else if (await this.userAuth.isReviewerOfProposal(agent, proposalID)) {
      const review = await this.dataSource.getTechnicalReview(proposalID);
      if (review) {
        review.comment = '';
      }

      return review;
    } else {
      return null;
    }
  }
}

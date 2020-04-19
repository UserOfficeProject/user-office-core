import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { Authorized } from '../decorators';
import { Review } from '../models/Review';
import { Roles } from '../models/Role';
import { TechnicalReview } from '../models/TechnicalReview';
import { User } from '../models/User';
import { UserAuthorization } from '../utils/UserAuthorization';

export default class ReviewQueries {
  constructor(
    private dataSource: ReviewDataSource,
    private userAuth: UserAuthorization
  ) {}

  @Authorized()
  async get(agent: User | null, id: number): Promise<Review | null> {
    const review = await this.dataSource.get(id);
    if (!review) {
      return null;
    }

    if (
      (await this.userAuth.isUserOfficer(agent)) ||
      review.userID === (agent as User).id
    ) {
      return this.dataSource.get(id);
    } else {
      return null;
    }
  }

  @Authorized([Roles.USER_OFFICER])
  async reviewsForProposal(
    agent: User | null,
    proposalId: number
  ): Promise<Review[] | null> {
    return this.dataSource.getProposalReviews(proposalId);
  }

  @Authorized()
  async technicalReviewForProposal(
    user: User | null,
    proposalID: number
  ): Promise<TechnicalReview | null> {
    if (await this.userAuth.isUserOfficer(user)) {
      return this.dataSource.getTechnicalReview(proposalID);
    } else if (await this.userAuth.isReviewerOfProposal(user, proposalID)) {
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

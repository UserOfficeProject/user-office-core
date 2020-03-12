import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { Review } from '../models/Review';
import { TechnicalReview } from '../models/TechnicalReview';
import { User } from '../models/User';
import { UserAuthorization } from '../utils/UserAuthorization';

export default class ReviewQueries {
  constructor(
    private dataSource: ReviewDataSource,
    private userAuth: UserAuthorization
  ) {}

  async get(agent: User | null, id: number): Promise<Review | null> {
    const review = await this.dataSource.get(id);
    if (!review || !agent) {
      return null;
    }

    if (
      (await this.userAuth.isUserOfficer(agent)) ||
      review.userID === agent.id
    ) {
      return this.dataSource.get(id);
    } else {
      return null;
    }
  }

  async reviewsForProposal(
    agent: User | null,
    proposalId: number
  ): Promise<Review[] | []> {
    if (await this.userAuth.isUserOfficer(agent)) {
      return this.dataSource.getProposalReviews(proposalId);
    } else {
      return [];
    }
  }

  async technicalReviewForProposal(
    user: User | null,
    proposalID: number
  ): Promise<TechnicalReview | null> {
    if (await this.userAuth.isUserOfficer(user)) {
      return this.dataSource.getTechnicalReview(proposalID);
    } else {
      return null;
    }
  }
}

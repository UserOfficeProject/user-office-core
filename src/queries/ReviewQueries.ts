import { ReviewDataSource } from "../datasources/ReviewDataSource";
import { UserAuthorization } from "../utils/UserAuthorization";

import { User } from "../models/User";
import { Review } from "../models/Review";

export default class ReviewQueries {
  constructor(
    private dataSource: ReviewDataSource,
    private userAuth: UserAuthorization
  ) {}

  async get(agent: User | null, id: number) {
    if (await this.userAuth.isUserOfficer(agent)) {
      return this.dataSource.get(id);
    } else {
      return null;
    }
  }

  async reviewsForProposal(
    agent: User | null,
    proposalId: number
  ): Promise<Review[] | null> {
    if (await this.userAuth.isUserOfficer(agent)) {
      return this.dataSource.getProposalReviews(proposalId);
    } else {
      return null;
    }
  }
}

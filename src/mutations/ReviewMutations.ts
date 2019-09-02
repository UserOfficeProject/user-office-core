import { ReviewDataSource } from "../datasources/ReviewDataSource";
import { User } from "../models/User";
import { EventBus } from "../events/eventBus";
import { ApplicationEvent } from "../events/applicationEvents";
import { rejection, Rejection } from "../rejection";
import { Review } from "../models/Review";
import { UserAuthorization } from "../utils/UserAuthorization";

export default class ReviewMutations {
  constructor(
    private dataSource: ReviewDataSource,
    private userAuth: UserAuthorization,
    private eventBus: EventBus<ApplicationEvent>
  ) {}

  async submitReview(
    agent: User | null,
    reviewID: number,
    comment: string,
    grade: number
  ): Promise<Review | Rejection> {
    const review = await this.dataSource.get(reviewID);
    if (
      review &&
      !(await this.userAuth.isReviewerOfProposal(agent, review.proposalID))
    ) {
      return rejection("NOT_REVIEWER_OF_PROPOSAL");
    }
    const result = await this.dataSource.submitReview(reviewID, comment, grade);
    return result || rejection("INTERNAL_ERROR");
  }

  async removeUserForReview(agent: User | null, id: number) {
    if (agent == null) {
      return rejection("NOT_LOGGED_IN");
    }
    if (!(await this.userAuth.isUserOfficer(agent))) {
      return rejection("NOT_USER_OFFICER");
    }
    const result = await this.dataSource.removeUserForReview(id);

    return result || rejection("INTERNAL_ERROR");
  }

  async addUserForReview(
    agent: User | null,
    userID: number,
    proposalID: number
  ): Promise<Boolean | Rejection> {
    if (agent == null) {
      return rejection("NOT_LOGGED_IN");
    }
    if (!(await this.userAuth.isUserOfficer(agent))) {
      return rejection("NOT_USER_OFFICER");
    }
    const result = await this.dataSource.addUserForReview(userID, proposalID);

    return result || rejection("INTERNAL_ERROR");
  }
}

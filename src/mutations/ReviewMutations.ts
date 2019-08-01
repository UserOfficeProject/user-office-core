import { ReviewDataSource } from "../datasources/ReviewDataSource";
import { User } from "../models/User";
import { EventBus } from "../events/eventBus";
import { ApplicationEvent } from "../events/applicationEvents";
import { rejection, Rejection } from "../rejection";
import { Review } from "../models/Review";

export default class ReviewMutations {
  constructor(
    private dataSource: ReviewDataSource,
    private userAuth: any,
    private eventBus: EventBus<ApplicationEvent>
  ) {}

  async submitReview(
    user: User | null,
    reviewID: number,
    comment: string,
    grade: number
  ): Promise<Review | Rejection> {
    const result = await this.dataSource.submitReview(reviewID, comment, grade);
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

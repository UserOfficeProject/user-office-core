import { ReviewDataSource } from "../datasources/ReviewDataSource";
import { User } from "../models/User";
import { EventBus } from "../events/eventBus";
import { ApplicationEvent } from "../events/applicationEvents";
import { rejection, Rejection } from "../rejection";
import { Review } from "../models/Review";
import { UserAuthorization } from "../utils/UserAuthorization";
import { logger } from "../utils/Logger";

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
    return this.dataSource
      .submitReview(reviewID, comment, grade)
      .then(review => review)
      .catch(err => {
        logger.logException("Could not submit review", err, {
          agent,
          reviewID,
          comment,
          grade
        });
        return rejection("INTERNAL_ERROR");
      });
  }

  async removeUserForReview(
    agent: User | null,
    id: number
  ): Promise<Review | Rejection> {
    if (!agent) {
      return rejection("NOT_LOGGED_IN");
    }
    if (!(await this.userAuth.isUserOfficer(agent))) {
      return rejection("NOT_USER_OFFICER");
    }
    return this.dataSource
      .removeUserForReview(id)
      .then(review => review)
      .catch(err => {
        logger.logException("Could not remove user for review", err, {
          agent,
          id
        });
        return rejection("INTERNAL_ERROR");
      });
  }

  async addUserForReview(
    agent: User | null,
    userID: number,
    proposalID: number
  ): Promise<Review | Rejection> {
    if (agent == null) {
      return rejection("NOT_LOGGED_IN");
    }
    if (!(await this.userAuth.isUserOfficer(agent))) {
      return rejection("NOT_USER_OFFICER");
    }
    return this.dataSource
      .addUserForReview(userID, proposalID)
      .then(review => review)
      .catch(err => {
        logger.logException("Failed to add user for review", err, {
          agent,
          userID,
          proposalID
        });
        return rejection("INTERNAL_ERROR");
      });
  }
}

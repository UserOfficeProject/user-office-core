import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { Authorized } from '../decorators';
import { Review } from '../models/Review';
import { Roles } from '../models/Role';
import { TechnicalReview } from '../models/TechnicalReview';
import { User } from '../models/User';
import { rejection, Rejection } from '../rejection';
import { AddReviewArgs } from '../resolvers/mutations/AddReviewMutation';
import { AddTechnicalReviewArgs } from '../resolvers/mutations/AddTechnicalReviewMutation';
import { AddUserForReviewArgs } from '../resolvers/mutations/AddUserForReviewMutation';
import { logger } from '../utils/Logger';
import { UserAuthorization } from '../utils/UserAuthorization';

export default class ReviewMutations {
  constructor(
    private dataSource: ReviewDataSource,
    private userAuth: UserAuthorization
  ) {}

  @Authorized()
  async updateReview(
    agent: User | null,
    args: AddReviewArgs
  ): Promise<Review | Rejection> {
    const { reviewID, comment, grade } = args;
    const review = await this.dataSource.get(reviewID);
    if (
      review &&
      !(
        (await this.userAuth.isReviewerOfProposal(agent, review.proposalID)) ||
        (await this.userAuth.isUserOfficer(agent))
      )
    ) {
      logger.logWarn('Blocked submitting review', { agent, args });

      return rejection('NOT_REVIEWER_OF_PROPOSAL');
    }

    return this.dataSource
      .updateReview(args)
      .then(review => review)
      .catch(err => {
        logger.logException('Could not submit review', err, {
          agent,
          reviewID,
          comment,
          grade,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  @Authorized([Roles.USER_OFFICER])
  async setTechnicalReview(
    agent: User | null,
    args: AddTechnicalReviewArgs
  ): Promise<TechnicalReview | Rejection> {
    return this.dataSource
      .setTechnicalReview(args)
      .then(review => review)
      .catch(err => {
        logger.logException('Could not set technicalReview', err, {
          agent,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  @Authorized([Roles.USER_OFFICER])
  async removeUserForReview(
    agent: User | null,
    id: number
  ): Promise<Review | Rejection> {
    return this.dataSource
      .removeUserForReview(id)
      .then(review => review)
      .catch(err => {
        logger.logException('Could not remove user for review', err, {
          agent,
          id,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  @Authorized([Roles.USER_OFFICER])
  async addUserForReview(
    agent: User | null,
    args: AddUserForReviewArgs
  ): Promise<Review | Rejection> {
    const { proposalID, userID } = args;

    return this.dataSource
      .addUserForReview(args)
      .then(review => review)
      .catch(err => {
        logger.logException('Failed to add user for review', err, {
          agent,
          userID,
          proposalID,
        });

        return rejection('INTERNAL_ERROR');
      });
  }
}

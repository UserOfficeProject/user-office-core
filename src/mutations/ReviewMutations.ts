import {
  proposalGradeValidationSchema,
  proposalTechnicalReviewValidationSchema,
  removeUserForReviewValidationSchema,
  addUserForReviewValidationSchema,
} from '@esss-swap/duo-validation';

import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { Authorized, EventBus, ValidateArgs } from '../decorators';
import { Event } from '../events/event.enum';
import { Review } from '../models/Review';
import { Roles } from '../models/Role';
import { TechnicalReview } from '../models/TechnicalReview';
import { UserWithRole } from '../models/User';
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

  @ValidateArgs(proposalGradeValidationSchema)
  @Authorized()
  async updateReview(
    agent: UserWithRole | null,
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

  @EventBus(Event.PROPOSAL_FEASIBILITY_REVIEW_SUBMITTED)
  @ValidateArgs(proposalTechnicalReviewValidationSchema)
  @Authorized([Roles.USER_OFFICER, Roles.INSTRUMENT_SCIENTIST])
  async setTechnicalReview(
    agent: UserWithRole | null,
    args: AddTechnicalReviewArgs
  ): Promise<TechnicalReview | Rejection> {
    if (
      !(
        (await this.userAuth.isUserOfficer(agent)) ||
        (await this.userAuth.isScientistToProposal(agent, args.proposalID))
      )
    ) {
      logger.logWarn('Blocked submitting technical review', { agent, args });

      return rejection('INSUFFICIENT_PERMISSIONS');
    }

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

  @ValidateArgs(removeUserForReviewValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async removeUserForReview(
    agent: UserWithRole | null,
    { reviewID }: { reviewID: number }
  ): Promise<Review | Rejection> {
    return this.dataSource
      .removeUserForReview(reviewID)
      .then(review => review)
      .catch(err => {
        logger.logException('Could not remove user for review', err, {
          agent,
          reviewID,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(addUserForReviewValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async addUserForReview(
    agent: UserWithRole | null,
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

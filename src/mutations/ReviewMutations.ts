import { logger } from '@esss-swap/duo-logger';
import {
  proposalGradeValidationSchema,
  proposalTechnicalReviewValidationSchema,
  addUserForReviewValidationSchema,
} from '@esss-swap/duo-validation';

import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { Authorized, EventBus, ValidateArgs } from '../decorators';
import { Event } from '../events/event.enum';
import { Review, ReviewStatus } from '../models/Review';
import { Roles } from '../models/Role';
import { TechnicalReview } from '../models/TechnicalReview';
import { UserWithRole } from '../models/User';
import { rejection, Rejection } from '../rejection';
import { AddReviewArgs } from '../resolvers/mutations/AddReviewMutation';
import { AddTechnicalReviewInput } from '../resolvers/mutations/AddTechnicalReviewMutation';
import { AddUserForReviewArgs } from '../resolvers/mutations/AddUserForReviewMutation';
import { SubmitTechnicalReviewInput } from '../resolvers/mutations/SubmitTechnicalReviewMutation';
import { UserAuthorization } from '../utils/UserAuthorization';

export default class ReviewMutations {
  constructor(
    private dataSource: ReviewDataSource,
    private userAuth: UserAuthorization
  ) {}

  @EventBus(Event.PROPOSAL_SEP_REVIEW_UPDATED)
  @ValidateArgs(proposalGradeValidationSchema)
  @Authorized()
  async updateReview(
    agent: UserWithRole | null,
    args: AddReviewArgs
  ): Promise<Review | Rejection> {
    const { reviewID, comment, grade } = args;
    const review = await this.dataSource.get(reviewID);

    if (!review) {
      return rejection('NOT_FOUND');
    }

    if (
      !(
        (await this.userAuth.isReviewerOfProposal(agent, review.proposalID)) ||
        (await this.userAuth.isChairOrSecretaryOfSEP(
          agent!.id,
          review.sepID
        )) ||
        this.userAuth.isUserOfficer(agent)
      )
    ) {
      logger.logWarn('Blocked submitting review', { agent, args });

      return rejection('NOT_REVIEWER_OF_PROPOSAL');
    }

    if (review.status === ReviewStatus.SUBMITTED) {
      return rejection('NOT_ALLOWED');
    }

    return this.dataSource
      .updateReview(args)
      .then((review) => review)
      .catch((err) => {
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
    args: AddTechnicalReviewInput | SubmitTechnicalReviewInput
  ): Promise<TechnicalReview | Rejection> {
    if (
      !(
        this.userAuth.isUserOfficer(agent) ||
        (await this.userAuth.isScientistToProposal(agent, args.proposalID))
      )
    ) {
      logger.logWarn('Blocked submitting technical review', { agent, args });

      return rejection('INSUFFICIENT_PERMISSIONS');
    }

    const shouldSubmitTechnicalReview = 'submitted' in args && args.submitted;

    return this.dataSource
      .setTechnicalReview(args, shouldSubmitTechnicalReview)
      .then((review) => review)
      .catch((err) => {
        logger.logException('Could not set technicalReview', err, {
          agent,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  @Authorized([Roles.USER_OFFICER, Roles.SEP_SECRETARY, Roles.SEP_CHAIR])
  async removeUserForReview(
    agent: UserWithRole | null,
    { reviewId, sepId }: { reviewId: number; sepId: number }
  ): Promise<Review | Rejection> {
    if (
      !(await this.userAuth.isUserOfficer(agent)) &&
      !(await this.userAuth.isChairOrSecretaryOfSEP(agent!.id, sepId))
    ) {
      return rejection('NOT_ALLOWED');
    }

    return this.dataSource
      .removeUserForReview(reviewId)
      .then((review) => review)
      .catch((err) => {
        logger.logException('Could not remove user for review', err, {
          agent,
          reviewId,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(addUserForReviewValidationSchema)
  @Authorized([Roles.USER_OFFICER, Roles.SEP_SECRETARY, Roles.SEP_CHAIR])
  async addUserForReview(
    agent: UserWithRole | null,
    args: AddUserForReviewArgs
  ): Promise<Review | Rejection> {
    const { proposalID, userID, sepID } = args;
    if (
      !this.userAuth.isUserOfficer(agent) &&
      !(await this.userAuth.isChairOrSecretaryOfSEP(agent!.id, sepID))
    ) {
      return rejection('NOT_ALLOWED');
    }

    return this.dataSource
      .addUserForReview(args)
      .then((review) => review)
      .catch((err) => {
        logger.logException('Failed to add user for review', err, {
          agent,
          userID,
          proposalID,
        });

        return rejection('INTERNAL_ERROR');
      });
  }
}

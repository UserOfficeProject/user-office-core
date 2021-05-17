import {
  proposalGradeValidationSchema,
  proposalTechnicalReviewValidationSchema,
  addUserForReviewValidationSchema,
} from '@esss-swap/duo-validation';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalSettingsDataSource } from '../datasources/ProposalSettingsDataSource';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { Authorized, EventBus, ValidateArgs } from '../decorators';
import { Event } from '../events/event.enum';
import { rejection, Rejection } from '../models/Rejection';
import {
  Review,
  ReviewStatus,
  ReviewWithNextProposalStatus,
} from '../models/Review';
import { Roles } from '../models/Role';
import { TechnicalReview } from '../models/TechnicalReview';
import { UserWithRole } from '../models/User';
import { AddReviewArgs } from '../resolvers/mutations/AddReviewMutation';
import { AddTechnicalReviewInput } from '../resolvers/mutations/AddTechnicalReviewMutation';
import { AddUserForReviewArgs } from '../resolvers/mutations/AddUserForReviewMutation';
import { ProposalIdWithReviewId } from '../resolvers/mutations/SubmitProposalsReviewMutation';
import { SubmitTechnicalReviewInput } from '../resolvers/mutations/SubmitTechnicalReviewMutation';
import { checkAllReviewsSubmittedOnProposal } from '../utils/helperFunctions';
import { UserAuthorization } from '../utils/UserAuthorization';

@injectable()
export default class ReviewMutations {
  constructor(
    @inject(Tokens.ReviewDataSource) private dataSource: ReviewDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization,
    @inject(Tokens.ProposalSettingsDataSource)
    private proposalSettingsDataSource: ProposalSettingsDataSource
  ) {}

  @EventBus(Event.PROPOSAL_SEP_REVIEW_UPDATED)
  @ValidateArgs(proposalGradeValidationSchema, ['comment'])
  @Authorized()
  async updateReview(
    agent: UserWithRole | null,
    args: AddReviewArgs
  ): Promise<ReviewWithNextProposalStatus | Rejection> {
    const { reviewID, comment, grade } = args;
    const review = await this.dataSource.get(reviewID);

    if (!review) {
      return rejection('Could not update review because review was not found', {
        args,
      });
    }

    if (
      !(
        (await this.userAuth.isReviewerOfProposal(agent, review.proposalID)) ||
        (await this.userAuth.isChairOrSecretaryOfSEP(agent, review.sepID)) ||
        this.userAuth.isUserOfficer(agent)
      )
    ) {
      return rejection(
        'Can not update review because of insufficient permissions',
        { agent, args }
      );
    }

    if (
      review.status === ReviewStatus.SUBMITTED &&
      !this.userAuth.isUserOfficer(agent)
    ) {
      return rejection(
        'Can not update review because review already submitted',
        { agent, args }
      );
    }

    return this.dataSource
      .updateReview(args)
      .then(async (review) => {
        /**
         * NOTE: Check if all other Reviews are submitted and set the event that will be fired in the proposal workflow.
         * Based on that info get the next status that is coming in the workflow and return it for better experience on the frontend.
         */
        const allProposalReviews = await this.dataSource.getProposalReviews(
          review.proposalID
        );

        const allOtherReviewsSubmitted = checkAllReviewsSubmittedOnProposal(
          allProposalReviews,
          review
        );

        let event = Event.PROPOSAL_SEP_REVIEW_SUBMITTED;
        if (allOtherReviewsSubmitted) {
          event = Event.PROPOSAL_ALL_SEP_REVIEWS_SUBMITTED;
        }

        let nextProposalStatus = null;
        if (args.status === ReviewStatus.SUBMITTED) {
          nextProposalStatus = await this.proposalSettingsDataSource.getProposalNextStatus(
            review.proposalID,
            event
          );
        }

        return new ReviewWithNextProposalStatus(
          review.id,
          review.proposalID,
          review.userID,
          review.comment,
          review.grade,
          review.status,
          review.sepID,
          nextProposalStatus
        );
      })
      .catch((err) => {
        return rejection(
          'Could not submit review',
          { agent, reviewID, comment, grade },
          err
        );
      });
  }

  @EventBus(Event.PROPOSAL_SEP_REVIEW_SUBMITTED)
  @ValidateArgs(proposalGradeValidationSchema, ['comment'])
  @Authorized()
  async submitProposalReview(
    agent: UserWithRole | null,
    args: ProposalIdWithReviewId
  ): Promise<Review | Rejection> {
    const { reviewId } = args;
    const review = await this.dataSource.get(reviewId);

    if (!review) {
      return rejection(
        'Can not submit proposal review because review was not found',
        { args }
      );
    }

    if (
      !(
        (await this.userAuth.isReviewerOfProposal(agent, review.proposalID)) ||
        (await this.userAuth.isChairOrSecretaryOfSEP(agent, review.sepID)) ||
        this.userAuth.isUserOfficer(agent)
      )
    ) {
      return rejection(
        'Can not submit proposal review because of insufficient premissions',
        { agent, args }
      );
    }

    if (
      review.status === ReviewStatus.SUBMITTED &&
      !this.userAuth.isUserOfficer(agent)
    ) {
      return rejection(
        'Can not submit proposal review because review already submitted',
        { agent, args }
      );
    }

    return this.dataSource
      .updateReview({
        ...review,
        reviewID: review.id,
        status: ReviewStatus.SUBMITTED,
      })
      .catch((error) => {
        return rejection(
          'Can not submit proposal review because error occurred',
          { agent, args },
          error
        );
      });
  }

  @EventBus(Event.PROPOSAL_FEASIBILITY_REVIEW_UPDATED)
  @ValidateArgs(proposalTechnicalReviewValidationSchema, [
    'comment',
    'publicComment',
  ])
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
      return rejection(
        'Can not set technical review because of insufficient permissions',
        { agent, args }
      );
    }

    const technicalReview = await this.dataSource.getTechnicalReview(
      args.proposalID
    );

    const shouldUpdateReview = !!technicalReview?.id;

    if (!this.userAuth.isUserOfficer(agent) && technicalReview?.submitted) {
      return rejection(
        'Can not set technical review because review already submitted',
        { agent, args }
      );
    }

    return this.dataSource
      .setTechnicalReview(args, shouldUpdateReview)
      .then((review) => review)
      .catch((err) => {
        return rejection(
          'Can not set technical review because review already submitted',
          { agent, args },
          err
        );
      });
  }

  @Authorized([Roles.USER_OFFICER, Roles.SEP_SECRETARY, Roles.SEP_CHAIR])
  async removeUserForReview(
    agent: UserWithRole | null,
    { reviewId, sepId }: { reviewId: number; sepId: number }
  ): Promise<Review | Rejection> {
    if (
      !this.userAuth.isUserOfficer(agent) &&
      !(await this.userAuth.isChairOrSecretaryOfSEP(agent, sepId))
    ) {
      return rejection(
        'Can not remove user for review because of insufficient permissions',
        { agent, reviewId, sepId }
      );
    }

    return this.dataSource
      .removeUserForReview(reviewId)
      .then((review) => review)
      .catch((error) => {
        return rejection(
          'Can not remove user for review because error occurred',
          { agent, reviewId, sepId },
          error
        );
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
      !(await this.userAuth.isChairOrSecretaryOfSEP(agent, sepID))
    ) {
      return rejection(
        'Can not add user for review because of insufficient permissions',
        { agent, args }
      );
    }

    return this.dataSource
      .addUserForReview(args)
      .then((review) => review)
      .catch((err) => {
        return rejection(
          'Can not add user for review because of insufficient permissions',
          { agent, userID, proposalID },
          err
        );
      });
  }
}

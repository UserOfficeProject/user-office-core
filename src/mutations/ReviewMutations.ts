import {
  proposalGradeValidationSchema,
  proposalTechnicalReviewValidationSchema,
  addUserForReviewValidationSchema,
  submitProposalReviewValidationSchema,
} from '@user-office-software/duo-validation';
import { container, inject, injectable } from 'tsyringe';

import { ReviewAuthorization } from '../auth/ReviewAuthorization';
import { TechnicalReviewAuthorization } from '../auth/TechnicalReviewAuthorization';
import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
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
import { AddTechnicalReviewInput } from '../resolvers/mutations/AddTechnicalReviewMutation';
import { AddUserForReviewArgs } from '../resolvers/mutations/AddUserForReviewMutation';
import { ProposalPkWithReviewId } from '../resolvers/mutations/SubmitProposalsReviewMutation';
import { SubmitTechnicalReviewInput } from '../resolvers/mutations/SubmitTechnicalReviewMutation';
import { UpdateReviewArgs } from '../resolvers/mutations/UpdateReviewMutation';
import { UpdateTechnicalReviewAssigneeInput } from '../resolvers/mutations/UpdateTechnicalReviewAssignee';
import { checkAllReviewsSubmittedOnProposal } from '../utils/helperFunctions';

@injectable()
export default class ReviewMutations {
  private technicalReviewAuth = container.resolve(TechnicalReviewAuthorization);
  private reviewAuth = container.resolve(ReviewAuthorization);

  constructor(
    @inject(Tokens.ReviewDataSource) private dataSource: ReviewDataSource,
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.ProposalSettingsDataSource)
    private proposalSettingsDataSource: ProposalSettingsDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
  ) {}

  @EventBus(Event.PROPOSAL_SEP_REVIEW_UPDATED)
  @ValidateArgs(proposalGradeValidationSchema, ['comment'])
  @Authorized()
  async updateReview(
    agent: UserWithRole | null,
    args: UpdateReviewArgs
  ): Promise<ReviewWithNextProposalStatus | Rejection> {
    const { reviewID, comment, grade } = args;
    const review = await this.dataSource.getReview(reviewID);

    if (!review) {
      return rejection('Could not update review because review was not found', {
        args,
      });
    }

    const hasWriteRights = await this.reviewAuth.hasWriteRights(agent, review);

    if (!hasWriteRights) {
      return rejection(
        'Can not update review because of insufficient permissions',
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
          review.proposalPk
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
          nextProposalStatus =
            await this.proposalSettingsDataSource.getProposalNextStatus(
              review.proposalPk,
              event
            );
        }

        return new ReviewWithNextProposalStatus(
          review.id,
          review.proposalPk,
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
  @ValidateArgs(submitProposalReviewValidationSchema)
  @Authorized()
  async submitProposalReview(
    agent: UserWithRole | null,
    args: ProposalPkWithReviewId
  ): Promise<Review | Rejection> {
    const { reviewId } = args;
    const review = await this.dataSource.getReview(reviewId);

    if (!review) {
      return rejection(
        'Can not submit proposal review because review was not found',
        { args }
      );
    }

    // NOTE: This is added for bulk submit where reviewer should be able to submit even already submitted reviews.
    const canSubmitAlreadySubmittedReview = true;

    const hasWriteRights = await this.reviewAuth.hasWriteRights(
      agent,
      review,
      canSubmitAlreadySubmittedReview
    );
    if (!hasWriteRights) {
      return rejection(
        'Can not submit proposal review because of insufficient permissions',
        { agent, args }
      );
    }

    const isReviewValid = await proposalGradeValidationSchema.isValid(review);
    if (isReviewValid === false) {
      return rejection(
        'Can not submit proposal review because review fields are not valid.',
        { args }
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

  @EventBus(Event.PROPOSAL_FEASIBILITY_REVIEW_SUBMITTED)
  @Authorized([Roles.USER_OFFICER, Roles.INSTRUMENT_SCIENTIST])
  async submitTechnicalReview(
    agent: UserWithRole | null,
    args: SubmitTechnicalReviewInput
  ): Promise<TechnicalReview | Rejection> {
    const hasWriteRights = await this.technicalReviewAuth.hasWriteRights(
      agent,
      args.proposalPk
    );
    if (!hasWriteRights) {
      return rejection(
        'Can not set technical review because of insufficient permissions',
        { agent, args }
      );
    }

    const technicalReview = await this.dataSource.getTechnicalReview(
      args.proposalPk
    );

    if (args.reviewerId !== undefined && args.reviewerId !== agent?.id) {
      return rejection('Request is impersonating another user', {
        args,
        agent,
      });
    }

    const shouldUpdateReview = technicalReview !== null;

    /**
     * TODO: This condition here is a special case because we usually create the review when proposal is assigned to the instrument.
     * When user officer tries to submit technical review directly on unassigned proposal to instrument we should create instead of updating nonexisting review.
     */
    const updatedTechnicalReview = shouldUpdateReview
      ? { ...technicalReview, ...args }
      : { ...args };

    const isReviewValid = await proposalTechnicalReviewValidationSchema.isValid(
      updatedTechnicalReview
    );
    if (isReviewValid === false) {
      return rejection(
        'Can not submit proposal technical review because fields are not valid.',
        { args }
      );
    }

    return this.dataSource
      .setTechnicalReview(args, shouldUpdateReview)
      .then((review) => review)
      .catch((err) => {
        return rejection(
          'An error occurred while trying to submit a technical review',
          { agent, args },
          err
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
    const hasWriteRights = await this.technicalReviewAuth.hasWriteRights(
      agent,
      args.proposalPk
    );
    if (!hasWriteRights) {
      return rejection(
        'Can not set technical review because of insufficient permissions',
        { agent, args }
      );
    }

    const technicalReview = await this.dataSource.getTechnicalReview(
      args.proposalPk
    );
    const shouldUpdateReview = technicalReview !== null;

    if (args.reviewerId !== undefined && args.reviewerId !== agent?.id) {
      return rejection('Request is impersonating another user', {
        args,
        agent,
      });
    }

    return this.dataSource
      .setTechnicalReview(args, shouldUpdateReview)
      .then((review) => review)
      .catch((err) => {
        return rejection(
          'An error occurred while trying to submit a technical review',
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

  async isTechnicalReviewAssignee(
    proposalPks: number[],
    assigneeUserId?: number
  ) {
    for await (const proposalPk of proposalPks) {
      const technicalReviewAssignee = (
        await this.dataSource.getTechnicalReview(proposalPk)
      )?.technicalReviewAssigneeId;
      if (technicalReviewAssignee !== assigneeUserId) {
        return false;
      }
    }

    return true;
  }

  @Authorized([Roles.USER_OFFICER, Roles.INSTRUMENT_SCIENTIST])
  async updateTechnicalReviewAssignee(
    agent: UserWithRole | null,
    args: UpdateTechnicalReviewAssigneeInput
  ): Promise<TechnicalReview[] | Rejection> {
    if (
      !this.userAuth.isUserOfficer(agent) &&
      !this.isTechnicalReviewAssignee(args.proposalPks, agent?.id)
    ) {
      return rejection('NOT_ALLOWED');
    }

    return this.proposalDataSource.updateProposalTechnicalReviewer(args);
  }

  @ValidateArgs(addUserForReviewValidationSchema)
  @Authorized([Roles.USER_OFFICER, Roles.SEP_SECRETARY, Roles.SEP_CHAIR])
  async addUserForReview(
    agent: UserWithRole | null,
    args: AddUserForReviewArgs
  ): Promise<Review | Rejection> {
    const { proposalPk, userID, sepID } = args;
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
          { agent, userID, proposalPk },
          err
        );
      });
  }
}

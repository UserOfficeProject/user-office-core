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
import { CallDataSource } from '../datasources/CallDataSource';
import { FapDataSource } from '../datasources/FapDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { SampleDataSource } from '../datasources/SampleDataSource';
import { Authorized, EventBus, ValidateArgs } from '../decorators';
import { Event } from '../events/event.enum';
import { rejection, Rejection } from '../models/Rejection';
import { Review, ReviewStatus } from '../models/Review';
import { Roles } from '../models/Role';
import { TechnicalReview } from '../models/TechnicalReview';
import { UserWithRole } from '../models/User';
import { AddTechnicalReviewInput } from '../resolvers/mutations/AddTechnicalReviewMutation';
import { AddUserForReviewArgs } from '../resolvers/mutations/AddUserForReviewMutation';
import { ProposalPkWithReviewId } from '../resolvers/mutations/SubmitProposalsReviewMutation';
import { SubmitSampleReviewArg } from '../resolvers/mutations/SubmitSampleReviewMutation';
import { SubmitTechnicalReviewInput } from '../resolvers/mutations/SubmitTechnicalReviewMutation';
import { UpdateReviewArgs } from '../resolvers/mutations/UpdateReviewMutation';
import { UpdateTechnicalReviewAssigneeInput } from '../resolvers/mutations/UpdateTechnicalReviewAssigneeMutation';

@injectable()
export default class ReviewMutations {
  private technicalReviewAuth = container.resolve(TechnicalReviewAuthorization);
  private reviewAuth = container.resolve(ReviewAuthorization);

  constructor(
    @inject(Tokens.ReviewDataSource) private dataSource: ReviewDataSource,
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.FapDataSource)
    private fapDataSource: FapDataSource,
    @inject(Tokens.CallDataSource)
    private callDataSource: CallDataSource,
    @inject(Tokens.QuestionaryDataSource)
    private questionaryDataSource: QuestionaryDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization,
    @inject(Tokens.SampleDataSource) private sampleDataSource: SampleDataSource
  ) {}

  @EventBus(Event.PROPOSAL_FAP_REVIEW_UPDATED)
  @ValidateArgs(proposalGradeValidationSchema, ['comment'])
  @Authorized()
  async updateReview(
    agent: UserWithRole | null,
    args: UpdateReviewArgs
  ): Promise<Review | Rejection> {
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

    return this.dataSource.updateReview(args).catch((err) => {
      return rejection(
        'Could not submit review',
        { agent, reviewID, comment, grade },
        err
      );
    });
  }

  @EventBus(Event.PROPOSAL_FAP_REVIEW_SUBMITTED)
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
  @Authorized([
    Roles.USER_OFFICER,
    Roles.INSTRUMENT_SCIENTIST,
    Roles.FAP_CHAIR,
    Roles.FAP_SECRETARY,
  ])
  async submitTechnicalReview(
    agent: UserWithRole | null,
    args: SubmitTechnicalReviewInput
  ): Promise<TechnicalReview | Rejection> {
    const hasWriteRights = await this.technicalReviewAuth.hasWriteRights(
      agent,
      args.proposalPk,
      args.instrumentId
    );
    if (!hasWriteRights) {
      return rejection(
        'Can not set technical review because of insufficient permissions',
        { agent, args }
      );
    }

    const technicalReview =
      await this.dataSource.getProposalInstrumentTechnicalReview(
        args.proposalPk,
        args.instrumentId
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

  @EventBus(Event.PROPOSAL_SAMPLE_REVIEW_SUBMITTED)
  @Authorized([Roles.USER_OFFICER, Roles.EXPERIMENT_SAFETY_REVIEWER])
  async submitSampleReview(
    agent: UserWithRole | null,
    args: SubmitSampleReviewArg
  ) {
    const sample = await this.sampleDataSource.getSample(args.sampleId);

    if (!sample) {
      return rejection('Sample does not exist', { agent, args });
    }

    return this.sampleDataSource
      .submitReview(args)
      .then((sample) => sample)
      .catch((error) => {
        return rejection(
          'Can not update sample because an error occurred',
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
  @Authorized([
    Roles.USER_OFFICER,
    Roles.INSTRUMENT_SCIENTIST,
    Roles.FAP_CHAIR,
    Roles.FAP_SECRETARY,
  ])
  async setTechnicalReview(
    agent: UserWithRole | null,
    args: AddTechnicalReviewInput | SubmitTechnicalReviewInput
  ): Promise<TechnicalReview | Rejection> {
    const hasWriteRights = await this.technicalReviewAuth.hasWriteRights(
      agent,
      args.proposalPk,
      args.instrumentId
    );
    if (!hasWriteRights) {
      return rejection(
        'Can not set technical review because of insufficient permissions',
        { agent, args }
      );
    }

    const technicalReview =
      await this.dataSource.getProposalInstrumentTechnicalReview(
        args.proposalPk,
        args.instrumentId
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
          'An error occurred while trying to create a technical review',
          { agent, args },
          err
        );
      });
  }

  @Authorized([Roles.USER_OFFICER, Roles.FAP_SECRETARY, Roles.FAP_CHAIR])
  async removeUserForReview(
    agent: UserWithRole | null,
    { reviewId, fapId }: { reviewId: number; fapId: number }
  ): Promise<Review | Rejection> {
    if (
      !this.userAuth.isUserOfficer(agent) &&
      !(await this.userAuth.isChairOrSecretaryOfFap(agent, fapId))
    ) {
      return rejection(
        'Can not remove user for review because of insufficient permissions',
        { agent, reviewId, fapId }
      );
    }

    return this.dataSource
      .removeUserForReview(reviewId)
      .then((review) => review)
      .catch((error) => {
        return rejection(
          'Can not remove user for review because error occurred',
          { agent, reviewId, fapId },
          error
        );
      });
  }

  async isTechnicalReviewAssignee(
    proposalPks: number[],
    instrumentId: number,
    loggedInUserId?: number
  ) {
    for await (const proposalPk of proposalPks) {
      const technicalReviewAssignee = (
        await this.dataSource.getProposalInstrumentTechnicalReview(
          proposalPk,
          instrumentId
        )
      )?.technicalReviewAssigneeId;
      if (technicalReviewAssignee !== loggedInUserId) {
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
      !this.isTechnicalReviewAssignee(
        args.proposalPks,
        args.instrumentId,
        agent?.id
      )
    ) {
      return rejection('NOT_ALLOWED');
    }

    return this.proposalDataSource.updateProposalTechnicalReviewer(args);
  }

  @ValidateArgs(addUserForReviewValidationSchema)
  @Authorized([Roles.USER_OFFICER, Roles.FAP_SECRETARY, Roles.FAP_CHAIR])
  async addUserForReview(
    agent: UserWithRole | null,
    args: AddUserForReviewArgs
  ): Promise<Review | Rejection> {
    const { proposalPk, userID, fapID } = args;
    if (
      !this.userAuth.isUserOfficer(agent) &&
      !(await this.userAuth.isChairOrSecretaryOfFap(agent, fapID))
    ) {
      return rejection(
        'Can not add user for review because of insufficient permissions',
        { agent, args }
      );
    }

    const fapProposal = await this.fapDataSource.getFapProposal(
      args.fapID,
      args.proposalPk
    );

    if (!fapProposal) {
      return rejection('Can not assign member to review because of an error', {
        agent,
        args,
      });
    }

    const fapCall = await this.callDataSource.getCall(fapProposal.callId);

    if (!fapCall) {
      return rejection('Can not assign member to review because of an error', {
        agent,
        args,
      });
    }

    const fapReviewQuestionary = await this.questionaryDataSource.create(
      args.userID,
      fapCall.fapReviewTemplateId
    );

    return this.dataSource
      .addUserForReview({
        userID: args.userID,
        proposalPk: args.proposalPk,
        fapID: args.fapID,
        questionaryID: fapReviewQuestionary.questionaryId,
      })
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

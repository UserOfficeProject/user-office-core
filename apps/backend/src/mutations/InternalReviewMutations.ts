import { GraphQLError } from 'graphql';
import { container, inject, injectable } from 'tsyringe';

import { TechnicalReviewAuthorization } from '../auth/TechnicalReviewAuthorization';
import { Tokens } from '../config/Tokens';
import { InternalReviewDataSource } from '../datasources/InternalReviewDataSource';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { Authorized, EventBus } from '../decorators';
import { Event } from '../events/event.enum';
import { rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { CreateInternalReviewInput } from '../resolvers/mutations/internalReview/CreateInternalReviewMutation';
import { DeleteInternalReviewInput } from '../resolvers/mutations/internalReview/DeleteInternalReviewMutation';
import { UpdateInternalReviewInput } from '../resolvers/mutations/internalReview/UpdateInternalReviewMutation';

@injectable()
export default class InternalReviewMutations {
  private technicalReviewAuth = container.resolve(TechnicalReviewAuthorization);
  constructor(
    @inject(Tokens.InternalReviewDataSource)
    private internalReviewDataSource: InternalReviewDataSource,
    @inject(Tokens.ReviewDataSource)
    private reviewDataSource: ReviewDataSource
  ) {}

  @EventBus(Event.INTERNAL_REVIEW_CREATED)
  @Authorized([Roles.USER_OFFICER, Roles.INSTRUMENT_SCIENTIST])
  async create(agent: UserWithRole | null, input: CreateInternalReviewInput) {
    if (
      !(await this.technicalReviewAuth.hasAccessRightsToInternalReviews(
        agent,
        input.technicalReviewId
      ))
    ) {
      throw new GraphQLError('INSUFFICIENT_PERMISSIONS');
    }

    return await this.internalReviewDataSource.create(agent!, input);
  }

  @EventBus(Event.INTERNAL_REVIEW_UPDATED)
  @Authorized([
    Roles.USER_OFFICER,
    Roles.INSTRUMENT_SCIENTIST,
    Roles.INTERNAL_REVIEWER,
  ])
  async update(agent: UserWithRole | null, input: UpdateInternalReviewInput) {
    if (
      !(await this.technicalReviewAuth.hasAccessRightsToInternalReviews(
        agent,
        input.technicalReviewId
      ))
    ) {
      throw new GraphQLError('INSUFFICIENT_PERMISSIONS');
    }

    // NOTE: Check if the internal reviewer tries to update their own review and not another internal review on the same proposal.
    if (agent?.currentRole?.shortCode === Roles.INTERNAL_REVIEWER) {
      const reviewsThatCanUpdate =
        await this.internalReviewDataSource.getInternalReviews({
          reviewerId: agent.id,
        });

      if (!reviewsThatCanUpdate.some((item) => item.id === input.id)) {
        throw new GraphQLError('INSUFFICIENT_PERMISSIONS');
      }
    }

    const technicalReviewSubmitted = (
      await this.reviewDataSource.getTechnicalReviewById(
        input.technicalReviewId
      )
    )?.submitted;

    if (technicalReviewSubmitted) {
      throw new GraphQLError('NOT_ALLOWED');
    }

    return await this.internalReviewDataSource.update(agent!, input);
  }

  @EventBus(Event.INTERNAL_REVIEW_DELETED)
  @Authorized([Roles.USER_OFFICER, Roles.INSTRUMENT_SCIENTIST])
  async delete(agent: UserWithRole | null, input: DeleteInternalReviewInput) {
    if (
      !(await this.technicalReviewAuth.hasAccessRightsToInternalReviews(
        agent,
        input.technicalReviewId
      ))
    ) {
      throw new GraphQLError('INSUFFICIENT_PERMISSIONS');
    }

    const deletedInternalReview =
      await this.internalReviewDataSource.delete(input);

    if (!deletedInternalReview) {
      throw rejection('Could not delete internal review');
    }

    return deletedInternalReview;
  }
}

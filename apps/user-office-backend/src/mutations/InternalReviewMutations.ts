import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { InternalReviewDataSource } from '../datasources/InternalReviewDataSource';
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
  constructor(
    @inject(Tokens.InternalReviewDataSource)
    private internalReviewDataSource: InternalReviewDataSource
  ) {}

  // TODO: Check if the instrument scientist is the technical reviewer (or manager of instrument).
  @EventBus(Event.INTERNAL_REVIEW_CREATED)
  @Authorized([Roles.USER_OFFICER, Roles.INSTRUMENT_SCIENTIST])
  async create(agent: UserWithRole | null, input: CreateInternalReviewInput) {
    return await this.internalReviewDataSource.create(agent!, input);
  }

  // TODO: Check if the instrument scientist is the technical reviewer (or manager of instrument).
  @EventBus(Event.INTERNAL_REVIEW_UPDATED)
  @Authorized([Roles.USER_OFFICER, Roles.INSTRUMENT_SCIENTIST])
  async update(agent: UserWithRole | null, input: UpdateInternalReviewInput) {
    return await this.internalReviewDataSource.update(agent!, input);
  }

  @EventBus(Event.PREDEFINED_MESSAGE_DELETED)
  @Authorized([Roles.USER_OFFICER])
  async delete(agent: UserWithRole | null, input: DeleteInternalReviewInput) {
    const deletedInternalReview = await this.internalReviewDataSource.delete(
      input
    );

    if (!deletedInternalReview) {
      throw rejection('Could not delete internal review');
    }

    return deletedInternalReview;
  }
}

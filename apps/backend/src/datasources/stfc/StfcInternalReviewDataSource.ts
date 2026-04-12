import { GraphQLError } from 'graphql';
import { container } from 'tsyringe';

import { StfcUserDataSource } from './StfcUserDataSource';
import { Tokens } from '../../config/Tokens';
import { InternalReview } from '../../models/InternalReview';
import { Roles } from '../../models/Role';
import { UserWithRole } from '../../models/User';
import { CreateInternalReviewInput } from '../../resolvers/mutations/internalReview/CreateInternalReviewMutation';
import { DeleteInternalReviewInput } from '../../resolvers/mutations/internalReview/DeleteInternalReviewMutation';
import { InternalReviewDataSource } from '../InternalReviewDataSource';
import PostgresInternalReviewDataSource from '../postgres/InternalReviewDataSource';

const InternalReviewRoleNumber = 53; // STFC Internal Reviewer role ID

export default class StfcInternalReviewDataSource
  extends PostgresInternalReviewDataSource
  implements InternalReviewDataSource
{
  protected stfcUserDataSource: StfcUserDataSource = container.resolve(
    Tokens.UserDataSource
  ) as StfcUserDataSource;

  constructor() {
    super(container.resolve(Tokens.ReviewDataSource));
  }

  async create(
    agent: UserWithRole,
    input: CreateInternalReviewInput
  ): Promise<InternalReview> {
    const userRoles = await this.stfcUserDataSource.getUserRoles(
      input.reviewerId
    );
    if (!userRoles) {
      throw new Error('Reviewer not found');
    }
    if (!userRoles.find((role) => role.shortCode === Roles.INTERNAL_REVIEWER)) {
      // STFC Internal Reviewer role has ID 53
      await this.stfcUserDataSource.assignSTFCRoleToUser(
        input.reviewerId,
        InternalReviewRoleNumber
      );
    }

    return super.create(agent, input);
  }

  async delete(input: DeleteInternalReviewInput): Promise<InternalReview> {
    const internalReview = await this.getInternalReview(input.id);

    if (!internalReview) {
      throw new GraphQLError('Internal review not found');
    }

    const allAssignedInternalReviews = await this.getInternalReviews({
      reviewerId: internalReview.reviewerId,
    });

    // If user has no other internal reviews, remove the Internal Reviewer role
    if (allAssignedInternalReviews.length === 1) {
      await this.stfcUserDataSource.removeFapRoleFromUser(
        internalReview.reviewerId,
        InternalReviewRoleNumber
      );
    }

    return super.delete(input);
  }
}

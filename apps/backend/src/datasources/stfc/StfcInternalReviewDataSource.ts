import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { InternalReview } from '../../models/InternalReview';
import { Roles } from '../../models/Role';
import { UserWithRole } from '../../models/User';
import { CreateInternalReviewInput } from '../../resolvers/mutations/internalReview/CreateInternalReviewMutation';
import { InternalReviewDataSource } from '../InternalReviewDataSource';
import PostgresInternalReviewDataSource from '../postgres/InternalReviewDataSource';
import { StfcUserDataSource } from './StfcUserDataSource';

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
      this.stfcUserDataSource.assignSTFCRoleToUser(input.reviewerId, 53);
    }

    return super.create(agent, input);
  }
}

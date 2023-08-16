import { GraphQLError } from 'graphql';
import { container, inject, injectable } from 'tsyringe';

import { TechnicalReviewAuthorization } from '../auth/TechnicalReviewAuthorization';
import { Tokens } from '../config/Tokens';
import { InternalReviewDataSource } from '../datasources/InternalReviewDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { InternalReviewsFilter } from '../resolvers/queries/InternalReviewsQuery';

@injectable()
export default class InternalReviewQueries {
  private technicalReviewAuth = container.resolve(TechnicalReviewAuthorization);
  constructor(
    @inject(Tokens.InternalReviewDataSource)
    public dataSource: InternalReviewDataSource
  ) {}

  @Authorized([Roles.USER_OFFICER, Roles.INSTRUMENT_SCIENTIST])
  async get(agent: UserWithRole | null, id: number) {
    const internalReview = await this.dataSource.getInternalReview(id);

    return internalReview;
  }

  // TODO: Check the instrument scientist if it is part of the instrument attached on the proposal and internal reviewer
  @Authorized([
    Roles.USER_OFFICER,
    Roles.INSTRUMENT_SCIENTIST,
    Roles.INTERNAL_REVIEWER,
  ])
  async getAll(agent: UserWithRole | null, filter?: InternalReviewsFilter) {
    if (
      !(await this.technicalReviewAuth.hasAccessRightsToInternalReviews(
        agent,
        filter?.technicalReviewId
      ))
    ) {
      throw new GraphQLError('INSUFFICIENT_PERMISSIONS');
    }

    const internalReviews = await this.dataSource.getInternalReviews(filter);

    return internalReviews;
  }
}

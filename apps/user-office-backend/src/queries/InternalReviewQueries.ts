import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { InternalReviewDataSource } from '../datasources/InternalReviewDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { InternalReviewsFilter } from '../resolvers/queries/InternalReviewsQuery';

@injectable()
export default class InternalReviewQueries {
  constructor(
    @inject(Tokens.InternalReviewDataSource)
    public dataSource: InternalReviewDataSource
  ) {}

  @Authorized([Roles.USER_OFFICER, Roles.INSTRUMENT_SCIENTIST])
  async get(agent: UserWithRole | null, id: number) {
    const internalReview = await this.dataSource.getInternalReview(id);

    return internalReview;
  }

  @Authorized([Roles.USER_OFFICER, Roles.INSTRUMENT_SCIENTIST])
  async getAll(agent: UserWithRole | null, filter?: InternalReviewsFilter) {
    const internalReviews = await this.dataSource.getInternalReviews(filter);

    return internalReviews;
  }
}

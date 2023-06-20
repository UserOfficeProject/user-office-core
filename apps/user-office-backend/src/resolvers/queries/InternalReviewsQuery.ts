import { Ctx, Field, InputType, Int, Query, Resolver, Arg } from 'type-graphql';

import { ResolverContext } from '../../context';
import { InternalReview } from '../types/InternalReview';

@InputType()
export class InternalReviewsFilter {
  @Field(() => [Int], { nullable: true })
  public technicalReviewId?: number;
}

@Resolver()
export class InternalReviewsQuery {
  @Query(() => [InternalReview], { nullable: true })
  internalReviews(
    @Ctx() context: ResolverContext,
    @Arg('filter', () => InternalReviewsFilter, { nullable: true })
    filter: InternalReviewsFilter
  ) {
    return context.queries.internalReview.getAll(context.user, filter);
  }
}

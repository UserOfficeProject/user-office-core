import { Query, Arg, Ctx, Resolver, Int } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Review } from '../types/Review';

@Resolver()
export class ReviewQuery {
  @Query(() => Review, { nullable: true })
  review(
    @Arg('reviewId', () => Int) reviewId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.review.get(context.user, { reviewId });
  }

  @Query(() => [Review], { nullable: true })
  proposalReviews(
    @Arg('proposalPk', () => Int) proposalPk: number,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.review.reviewsForProposal(context.user, proposalPk);
  }
}

import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Review } from '../types/Review';

@Resolver()
export class RemoveUserForReviewMutation {
  @Mutation(() => Review)
  removeUserForReview(
    @Arg('reviewId', () => Int) reviewId: number,
    @Arg('sepId', () => Int) sepId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.review.removeUserForReview(context.user, {
      reviewId,
      sepId,
    });
  }
}

import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ReviewResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class RemoveUserForReviewMutation {
  @Mutation(() => ReviewResponseWrap)
  removeUserForReview(
    @Arg('reviewId', () => Int) reviewId: number,
    @Arg('sepId', () => Int) sepId: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.review.removeUserForReview(context.user, {
        reviewId,
        sepId,
      }),
      ReviewResponseWrap
    );
  }
}

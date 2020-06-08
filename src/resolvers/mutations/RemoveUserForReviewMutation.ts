import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ReviewResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class RemoveUserForReviewMutation {
  @Mutation(() => ReviewResponseWrap)
  removeUserForReview(
    @Arg('reviewID', () => Int) reviewID: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.review.removeUserForReview(context.user, { reviewID }),
      ReviewResponseWrap
    );
  }
}

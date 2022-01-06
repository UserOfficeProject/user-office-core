import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { FeedbackResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class DeleteFeedback {
  @Mutation(() => FeedbackResponseWrap)
  deleteFeedback(
    @Arg('feedbackId', () => Int) feedbackId: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.feedback.deleteFeedback(context.user, feedbackId),
      FeedbackResponseWrap
    );
  }
}

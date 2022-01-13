import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { FeedbackRequestWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class RequestFeedbackMutation {
  @Mutation(() => FeedbackRequestWrap)
  requestFeedback(
    @Arg('scheduledEventId', () => Int) scheduledEventId: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.feedback.requestFeedback(
        context.user,
        scheduledEventId
      ),
      FeedbackRequestWrap
    );
  }
}

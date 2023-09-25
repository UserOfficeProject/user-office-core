import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Feedback } from '../types/Feedback';

@Resolver()
export class DeleteFeedback {
  @Mutation(() => Feedback)
  deleteFeedback(
    @Arg('feedbackId', () => Int) feedbackId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.feedback.deleteFeedback(context.user, feedbackId);
  }
}

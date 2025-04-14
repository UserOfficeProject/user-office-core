import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { FeedbackRequest } from '../types/FeedbackRequest';

@Resolver()
export class RequestFeedbackMutation {
  @Mutation(() => FeedbackRequest)
  requestFeedback(
    @Arg('experimentPk', () => Int) experimentPk: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.feedback.requestFeedback(
      context.user,
      experimentPk
    );
  }
}

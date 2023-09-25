import { Arg, Ctx, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Feedback } from '../types/Feedback';

@Resolver()
export class FeedbackQuery {
  @Query(() => Feedback, { nullable: true })
  feedback(
    @Ctx() context: ResolverContext,
    @Arg('feedbackId', () => Int) feedbackId: number
  ) {
    return context.queries.feedback.getFeedback(context.user, feedbackId);
  }
}

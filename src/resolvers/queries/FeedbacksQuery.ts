import { Arg, Ctx, Field, InputType, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Feedback } from '../types/Feedback';

@InputType()
export class FeedbacksFilter {
  @Field(() => Int, { nullable: true })
  public creatorId?: number;

  @Field(() => Int, { nullable: true })
  public scheduledEventId?: number;

  public questionaryIds?: number[];
}

@Resolver()
export class FeedbacksQuery {
  @Query(() => [Feedback])
  feedbacks(
    @Ctx() context: ResolverContext,
    @Arg('filter', () => FeedbacksFilter, { nullable: true })
    filter?: FeedbacksFilter
  ) {
    return context.queries.feedback.getFeedbacks(context.user, filter);
  }
}

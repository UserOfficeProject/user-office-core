import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { FeedbackStatus } from '../../models/Feedback';
import { Feedback } from '../types/Feedback';

@ArgsType()
export class UpdateFeedbackArgs {
  @Field(() => Int)
  feedbackId: number;

  @Field(() => FeedbackStatus, { nullable: true })
  status?: FeedbackStatus;

  submittedAt?: Date | null;
}

@Resolver()
export class UpdateFeedbackMutation {
  @Mutation(() => Feedback)
  updateFeedback(
    @Args() args: UpdateFeedbackArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.feedback.updateFeedback(context.user, args);
  }
}

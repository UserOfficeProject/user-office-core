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
import { FeedbackResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class CreateFeedbackArgs {
  @Field(() => Int)
  scheduledEventId: number;

  questionaryId: number;
  creatorId: number;
}

@Resolver()
export class CreateFeedbackMutation {
  @Mutation(() => FeedbackResponseWrap)
  createFeedback(
    @Args() args: CreateFeedbackArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.feedback.createFeedback(context.user, args),
      FeedbackResponseWrap
    );
  }
}

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
import { Feedback } from '../types/Feedback';

@ArgsType()
export class CreateFeedbackArgs {
  @Field(() => Int)
  scheduledEventId: number;

  questionaryId: number;
  creatorId: number;
}

@Resolver()
export class CreateFeedbackMutation {
  @Mutation(() => Feedback)
  createFeedback(
    @Args() args: CreateFeedbackArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.feedback.createFeedback(context.user, args);
  }
}

import {
  Args,
  ArgsType,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { AnswerBasic } from '../types/AnswerBasic';

@InputType()
export class AnswerInput {
  @Field()
  questionId: string;

  @Field(() => String, { nullable: true })
  value: string;
}

@ArgsType()
export class AnswerTopicArgs {
  @Field(() => Int)
  public questionaryId: number;

  @Field(() => Int)
  public topicId: number;

  @Field(() => [AnswerInput])
  public answers: AnswerInput[];

  @Field(() => Boolean, { nullable: true })
  public isPartialSave?: boolean;
}

@Resolver()
export class UpdateQuestionaryMutation {
  @Mutation(() => [AnswerBasic])
  answerTopic(
    @Args()
    args: AnswerTopicArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.questionary.answerTopic(context.user, args);
  }
}

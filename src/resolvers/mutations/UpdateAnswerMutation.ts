import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  Mutation,
  ObjectType,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { Response } from '../Decorators';
import { ResponseWrapBase } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';
import { AnswerInput } from './AnswerTopicMutation';

@ArgsType()
export class UpdateAnswerArgs {
  @Field(() => Int)
  public questionaryId: number;

  @Field()
  public answer: AnswerInput;
}

@ObjectType()
export class UpdateAnswerResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => String, { nullable: true })
  public questionId: string;
}

@Resolver()
export class UpdateAnswerMutation {
  @Mutation(() => UpdateAnswerResponseWrap)
  updateAnswer(
    @Args() args: UpdateAnswerArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.questionary.updateAnswer(context.user, args),
      UpdateAnswerResponseWrap
    );
  }
}

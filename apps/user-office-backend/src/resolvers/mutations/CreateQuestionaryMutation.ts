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
import { QuestionaryResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class CreateQuestionaryArgs {
  @Field(() => Int)
  templateId: number;
}

@Resolver()
export class CreateQuestionaryMutation {
  @Mutation(() => QuestionaryResponseWrap)
  createQuestionary(
    @Args() args: CreateQuestionaryArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.questionary.create(context.user, args),
      QuestionaryResponseWrap
    );
  }
}

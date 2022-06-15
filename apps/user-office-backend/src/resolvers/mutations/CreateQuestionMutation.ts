import { Args, ArgsType, Ctx, Field, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { DataType, TemplateCategoryId } from '../../models/Template';
import { QuestionResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class CreateQuestionArgs {
  @Field(() => TemplateCategoryId)
  categoryId: TemplateCategoryId;

  @Field(() => DataType)
  dataType: DataType;
}

@Resolver()
export class CreateQuestionMutation {
  @Mutation(() => QuestionResponseWrap)
  createQuestion(
    @Args() args: CreateQuestionArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.template.createQuestion(context.user, args),
      QuestionResponseWrap
    );
  }
}

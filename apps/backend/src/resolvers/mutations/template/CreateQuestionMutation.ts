import { Args, ArgsType, Ctx, Field, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../../context';
import { DataType, TemplateCategoryId } from '../../../models/Template';
import { Question } from '../../types/Question';

@ArgsType()
export class CreateQuestionArgs {
  @Field(() => TemplateCategoryId)
  categoryId: TemplateCategoryId;

  @Field(() => DataType)
  dataType: DataType;
}

@Resolver()
export class CreateQuestionMutation {
  @Mutation(() => Question)
  createQuestion(
    @Args() args: CreateQuestionArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.template.createQuestion(context.user, args);
  }
}

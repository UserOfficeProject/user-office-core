import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../../context';
import { Template } from '../../types/Template';

@ArgsType()
export class DeleteQuestionTemplateRelationArgs {
  @Field(() => String)
  questionId: string;

  @Field(() => Int)
  templateId: number;
}

@Resolver()
export class DeleteQuestionTemplateRelationMutation {
  @Mutation(() => Template)
  deleteQuestionTemplateRelation(
    @Args() args: DeleteQuestionTemplateRelationArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.template.deleteQuestionTemplateRelation(
      context.user,
      args
    );
  }
}

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
import { TemplateResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class DeleteQuestionTemplateRelationArgs {
  @Field(() => String)
  questionId: string;

  @Field(() => Int)
  templateId: number;
}

@Resolver()
export class DeleteQuestionTemplateRelationMutation {
  @Mutation(() => TemplateResponseWrap)
  deleteQuestionTemplateRelation(
    @Args() args: DeleteQuestionTemplateRelationArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.template.deleteQuestionTemplateRelation(
        context.user,
        args
      ),
      TemplateResponseWrap
    );
  }
}

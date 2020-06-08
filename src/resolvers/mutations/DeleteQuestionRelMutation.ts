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
export class DeleteQuestionRelArgs {
  @Field(() => String)
  questionId: string;

  @Field(() => Int)
  templateId: number;
}

@Resolver()
export class DeleteQuestionRelMutation {
  @Mutation(() => TemplateResponseWrap)
  deleteQuestionRel(
    @Args() args: DeleteQuestionRelArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.template.deleteQuestionRel(context.user, args),
      TemplateResponseWrap
    );
  }
}

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
export class DeleteQuestionTopicRelationArgs {
  @Field(() => String)
  questionId: string;

  @Field(() => Int)
  templateId: number;
}

@Resolver()
export class DeleteQuestionRelMutation {
  @Mutation(() => TemplateResponseWrap)
  deleteQuestionTopicRelation(
    @Args() args: DeleteQuestionTopicRelationArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.template.deleteQuestionTopicRelation(
        context.user,
        args
      ),
      TemplateResponseWrap
    );
  }
}

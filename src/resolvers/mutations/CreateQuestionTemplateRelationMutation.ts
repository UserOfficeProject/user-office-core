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
export class CreateQuestionTemplateRelationArgs {
  @Field(() => Int)
  templateId: number;

  @Field()
  questionId: string;

  @Field(() => Int)
  sortOrder: number;

  @Field(() => Int)
  topicId: number;
}

@Resolver()
export class CreateQuestionTopicRelationMutation {
  @Mutation(() => TemplateResponseWrap)
  createQuestionTemplateRelation(
    @Args() args: CreateQuestionTemplateRelationArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.template.createQuestionTemplateRelation(
        context.user,
        args
      ),
      TemplateResponseWrap
    );
  }
}

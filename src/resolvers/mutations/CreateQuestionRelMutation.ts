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
import { FieldDependencyInput } from './UpdateQuestionRelMutation';

@ArgsType()
export class CreateQuestionRelArgs {
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
export class CreateQuestionRelMutation {
  @Mutation(() => TemplateResponseWrap)
  createQuestionRel(
    @Args() args: CreateQuestionRelArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.template.createQuestionRel(context.user, args),
      TemplateResponseWrap
    );
  }
}

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
export class CreateQuestionTopicRelationArgs {
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
  createQuestionTopicRelation(
    @Args() args: CreateQuestionTopicRelationArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.template.createQuestionTopicRelation(
        context.user,
        args
      ),
      TemplateResponseWrap
    );
  }
}

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
  @Mutation(() => Template)
  createQuestionTemplateRelation(
    @Args() args: CreateQuestionTemplateRelationArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.template.createQuestionTemplateRelation(
      context.user,
      args
    );
  }
}

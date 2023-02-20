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
import { GenericTemplate } from '../types/GenericTemplate';

@ArgsType()
export class CreateGenericTemplateWithClonedAnswersInput {
  @Field(() => String)
  title: string;

  @Field(() => Int)
  templateId: number;

  @Field(() => Int)
  proposalPk: number;

  @Field(() => String)
  questionId: string;

  @Field(() => Int)
  sourceQuestionaryId: number;
}

@Resolver()
export class CreateGenericTemplateWithClonedAnswersMutation {
  @Mutation(() => GenericTemplate)
  createGenericTemplateWithClonedAnswers(
    @Args() input: CreateGenericTemplateWithClonedAnswersInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.genericTemplate.createGenericTemplateWithClonedAnswers(
      context.user,
      input
    );
  }
}

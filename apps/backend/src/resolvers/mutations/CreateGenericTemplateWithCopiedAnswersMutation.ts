import {
  Args,
  ArgsType,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { GenericTemplate } from '../types/GenericTemplate';

@InputType()
export class CopyAnswerInput {
  @Field(() => String)
  title: string;
  @Field(() => Int)
  sourceQuestionaryId: number;
}

@ArgsType()
export class CreateGenericTemplateWithCopiedAnswersInput {
  @Field(() => Int)
  templateId: number;

  @Field(() => Int)
  proposalPk: number;

  @Field(() => String)
  questionId: string;

  @Field(() => [CopyAnswerInput])
  public copyAnswersInput: CopyAnswerInput[];
}

@Resolver()
export class CreateGenericTemplateWithCopiedAnswersMutation {
  @Mutation(() => [GenericTemplate])
  createGenericTemplateWithCopiedAnswers(
    @Args() input: CreateGenericTemplateWithCopiedAnswersInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.genericTemplate.createGenericTemplateWithCopiedAnswers(
      context.user,
      input
    );
  }
}

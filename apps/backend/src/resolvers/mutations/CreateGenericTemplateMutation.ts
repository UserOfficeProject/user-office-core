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
export class CreateGenericTemplateInput {
  @Field(() => String)
  title: string;

  @Field(() => Int)
  templateId: number;

  @Field(() => Int)
  proposalPk: number;

  @Field(() => String)
  questionId: string;
}

@Resolver()
export class CreateGenericTemplateMutation {
  @Mutation(() => GenericTemplate)
  createGenericTemplate(
    @Args() input: CreateGenericTemplateInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.genericTemplate.createGenericTemplate(
      context.user,
      input
    );
  }
}

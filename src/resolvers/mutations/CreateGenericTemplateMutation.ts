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
import { GenericTemplateResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

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
  @Mutation(() => GenericTemplateResponseWrap)
  createGenericTemplate(
    @Args() input: CreateGenericTemplateInput,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.genericTemplate.createGenericTemplate(
        context.user,
        input
      ),
      GenericTemplateResponseWrap
    );
  }
}

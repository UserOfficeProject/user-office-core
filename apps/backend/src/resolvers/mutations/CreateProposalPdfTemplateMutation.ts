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
import { ProposalPdfTemplate } from '../types/ProposalPdfTemplate';

@ArgsType()
export class CreateProposalPdfTemplateInput {
  @Field(() => Int)
  templateId: number;

  @Field(() => String)
  templateData: string;

  @Field(() => String)
  templateHeader: string;

  @Field(() => String)
  templateFooter: string;

  @Field(() => String)
  templateSampleDeclaration: string;

  @Field(() => String)
  dummyData: string;
}

@Resolver()
export class CreateProposalPdfTemplateMutation {
  @Mutation(() => ProposalPdfTemplate)
  createProposalPdfTemplate(
    @Args() input: CreateProposalPdfTemplateInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.proposalPdfTemplate.createProposalPdfTemplate(
      context.user,
      input
    );
  }
}

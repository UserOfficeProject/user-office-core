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
export class UpdateProposalPdfTemplateArgs {
  @Field(() => Int)
  proposalPdfTemplateId: number;

  @Field(() => String, { nullable: true })
  templateData?: string;

  @Field(() => String, { nullable: true })
  templateHeader?: string;

  @Field(() => String, { nullable: true })
  templateFooter?: string;

  @Field(() => String, { nullable: true })
  templateSampleDeclaration?: string;

  @Field(() => String, { nullable: true })
  dummyData?: string;
}

@Resolver()
export class UpdateProposalPdfTemplateMutation {
  @Mutation(() => ProposalPdfTemplate)
  updateProposalPdfTemplate(
    @Args() args: UpdateProposalPdfTemplateArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.proposalPdfTemplate.updateProposalPdfTemplate(
      context.user,
      args
    );
  }
}

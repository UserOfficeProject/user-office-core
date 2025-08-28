import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalPdfTemplate } from '../types/ProposalPdfTemplate';

@Resolver()
export class DeleteProposalPdfTemplateMutation {
  @Mutation(() => ProposalPdfTemplate)
  deleteProposalPdfTemplate(
    @Arg('proposalPdfTemplateId', () => Int) proposalPdfTemplateId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.proposalPdfTemplate.deleteProposalPdfTemplate(
      context.user,
      proposalPdfTemplateId
    );
  }
}

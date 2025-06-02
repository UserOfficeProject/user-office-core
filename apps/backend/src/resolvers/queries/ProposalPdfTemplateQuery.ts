import { Arg, Ctx, Query, Resolver, Int } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalPdfTemplate } from '../types/ProposalPdfTemplate';

@Resolver()
export class ProposalPdfTemplateQuery {
  @Query(() => ProposalPdfTemplate, { nullable: true })
  proposalPdfTemplate(
    @Ctx() context: ResolverContext,
    @Arg('proposalPdfTemplateId', () => Int)
    proposalPdfTemplateId: number
  ) {
    return context.queries.proposalPdfTemplate.getProposalPdfTemplate(
      context.user,
      proposalPdfTemplateId
    );
  }
}

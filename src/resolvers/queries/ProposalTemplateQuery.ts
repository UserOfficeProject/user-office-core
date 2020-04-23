import { Arg, Ctx, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalTemplate } from '../types/ProposalTemplate';

@Resolver()
export class ProposalTemplateQuery {
  @Query(() => ProposalTemplate, { nullable: true })
  proposalTemplate(
    @Ctx() context: ResolverContext,
    @Arg('templateId', () => Int) templateId: number
  ) {
    return context.queries.template.getProposalTemplateSteps(
      context.user,
      templateId
    );
  }
}

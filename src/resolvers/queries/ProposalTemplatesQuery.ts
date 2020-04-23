import { Ctx, Query, Resolver, Arg } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalTemplate } from '../types/ProposalTemplate';

@Resolver()
export class ProposalTemplatesQuery {
  @Query(() => [ProposalTemplate])
  proposalTemplates(
    @Ctx() context: ResolverContext,
    @Arg('isArchived', { nullable: true }) isArchived?: boolean
  ) {
    return context.queries.template.getProposalTemplates(
      context.user,
      isArchived || false
    );
  }
}

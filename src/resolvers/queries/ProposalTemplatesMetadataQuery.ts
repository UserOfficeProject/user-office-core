import { Ctx, Query, Resolver, Arg } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalTemplateMetadata } from '../types/ProposalTemplateMetadata';

@Resolver()
export class ProposalTemplateQuery {
  @Query(() => [ProposalTemplateMetadata])
  proposalTemplatesMetadata(
    @Ctx() context: ResolverContext,
    @Arg('isArchived', { nullable: true }) isArchived?: boolean
  ) {
    return context.queries.template.getProposalTemplatesMetadata(
      context.user,
      isArchived || false
    );
  }
}

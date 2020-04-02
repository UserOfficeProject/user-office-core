import { Ctx, Query, Resolver, Arg } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalTemplateMetadata } from '../types/ProposalTemplateMetadata';

@Resolver()
export class ProposalTemplateQuery {
  @Query(() => [ProposalTemplateMetadata])
  proposalTemplatesMetadata(
    @Arg('isArchived', { nullable: true }) isArchived: boolean,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.template.getProposalTemplatesMetadata(
      context.user,
      isArchived
    );
  }
}

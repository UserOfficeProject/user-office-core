import { Ctx, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalTemplate } from '../types/ProposalTemplate';
@Resolver()
export class ProposalTemplateQuery {
  @Query(() => ProposalTemplate, { nullable: true })
  proposalTemplate(@Ctx() context: ResolverContext) {
    return context.queries.template.getProposalTemplate(context.user);
  }
}

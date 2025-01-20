import { Query, Ctx, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalEvent } from '../types/StatusChangingEvent';

@Resolver()
export class ProposalWorkflowQuery {
  @Query(() => [ProposalEvent], {
    nullable: true,
  })
  proposalEvents(@Ctx() context: ResolverContext) {
    return context.queries.proposalSettings.getAllProposalEvents(context.user);
  }
}

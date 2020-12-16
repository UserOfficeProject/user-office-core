import { Query, Arg, Ctx, Resolver, Int } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalEvent } from '../types/NextStatusEvent';
import { ProposalWorkflow } from '../types/ProposalWorkflow';

@Resolver()
export class ProposalWorkflowQuery {
  @Query(() => ProposalWorkflow, { nullable: true })
  proposalWorkflow(
    @Arg('id', () => Int) id: number,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.proposalSettings.getProposalWorkflow(
      context.user,
      id
    );
  }

  @Query(() => [ProposalWorkflow], { nullable: true })
  proposalWorkflows(@Ctx() context: ResolverContext) {
    return context.queries.proposalSettings.getAllProposalWorkflows(
      context.user
    );
  }

  @Query(() => [ProposalEvent], {
    nullable: true,
  })
  proposalEvents(@Ctx() context: ResolverContext) {
    return context.queries.proposalSettings.getAllProposalEvents(context.user);
  }
}

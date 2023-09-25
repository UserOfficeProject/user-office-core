import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../../context';
import { ProposalWorkflow } from '../../types/ProposalWorkflow';

@Resolver()
export class DeleteProposalWorkflowMutation {
  @Mutation(() => ProposalWorkflow)
  async deleteProposalWorkflow(
    @Arg('id', () => Int) id: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.proposalSettings.deleteProposalWorkflow(
      context.user,
      {
        id,
      }
    );
  }
}

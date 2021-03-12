import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../../context';
import { ProposalWorkflowResponseWrap } from '../../types/CommonWrappers';
import { wrapResponse } from '../../wrapResponse';

@Resolver()
export class DeleteProposalWorkflowMutation {
  @Mutation(() => ProposalWorkflowResponseWrap)
  async deleteProposalWorkflow(
    @Arg('id', () => Int) id: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.proposalSettings.deleteProposalWorkflow(context.user, {
        id,
      }),
      ProposalWorkflowResponseWrap
    );
  }
}

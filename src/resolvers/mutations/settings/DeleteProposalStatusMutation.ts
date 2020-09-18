import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../../context';
import { ProposalStatusResponseWrap } from '../../types/CommonWrappers';
import { wrapResponse } from '../../wrapResponse';

@Resolver()
export class DeleteProposalStatusMutation {
  @Mutation(() => ProposalStatusResponseWrap)
  async deleteProposalStatus(
    @Arg('id', () => Int) id: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.proposalSettings.deleteProposalStatus(context.user, {
        id,
      }),
      ProposalStatusResponseWrap
    );
  }
}

import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../../context';
import { ProposalStatus } from '../../types/ProposalStatus';

@Resolver()
export class DeleteProposalStatusMutation {
  @Mutation(() => ProposalStatus)
  async deleteProposalStatus(
    @Arg('id', () => Int) id: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.proposalSettings.deleteProposalStatus(
      context.user,
      {
        id,
      }
    );
  }
}

import { Resolver, Mutation, Arg, Ctx, Int } from 'type-graphql';

import { ResolverContext } from '../../context';
import { SEPProposalResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class UpdateSEPProposalMutation {
  @Mutation(() => SEPProposalResponseWrap)
  async updateSEPTimeAllocation(
    @Arg('sepId', () => Int) sepId: number,
    @Arg('proposalId', () => Int) proposalId: number,

    @Arg('sepTimeAllocation', () => Int, { nullable: true })
    sepTimeAllocation: number | null,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sep.updateTimeAllocation(
        context.user,
        sepId,
        proposalId,
        sepTimeAllocation
      ),
      SEPProposalResponseWrap
    );
  }
}

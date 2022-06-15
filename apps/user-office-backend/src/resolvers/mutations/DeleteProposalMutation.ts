import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class DeleteProposalMutation {
  @Mutation(() => ProposalResponseWrap)
  deleteProposal(
    @Arg('proposalPk', () => Int) proposalPk: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.proposal.delete(context.user, { proposalPk }),
      ProposalResponseWrap
    );
  }
}

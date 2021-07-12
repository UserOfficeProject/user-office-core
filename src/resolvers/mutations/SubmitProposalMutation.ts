import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class SubmitProposalMutation {
  @Mutation(() => ProposalResponseWrap)
  submitProposal(
    @Arg('proposalPk', () => Int) proposalPk: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.proposal.submit(context.user, { proposalPk }),
      ProposalResponseWrap
    );
  }
}

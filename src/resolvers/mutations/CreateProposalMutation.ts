import { Ctx, Mutation, Resolver, Arg, Int } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class CreateProposalMutation {
  @Mutation(() => ProposalResponseWrap)
  createProposal(
    @Ctx() context: ResolverContext,
    @Arg('callId', () => Int) callId: number
  ) {
    return wrapResponse(
      context.mutations.proposal.create(context.user, { callId }),
      ProposalResponseWrap
    );
  }
}

import { Ctx, Mutation, Resolver, Arg, Int } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Proposal } from '../types/Proposal';

@Resolver()
export class CreateProposalMutation {
  @Mutation(() => Proposal)
  createProposal(
    @Ctx() context: ResolverContext,
    @Arg('callId', () => Int) callId: number
  ) {
    return context.mutations.proposal.create(context.user, { callId });
  }
}

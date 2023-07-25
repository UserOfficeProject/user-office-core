import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Proposal } from '../types/Proposal';

@Resolver()
export class SubmitProposalMutation {
  @Mutation(() => Proposal)
  submitProposal(
    @Arg('proposalPk', () => Int) proposalPk: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.proposal.submit(context.user, { proposalPk });
  }
}

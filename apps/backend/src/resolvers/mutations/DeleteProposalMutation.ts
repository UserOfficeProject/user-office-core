import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Proposal } from '../types/Proposal';

@Resolver()
export class DeleteProposalMutation {
  @Mutation(() => Proposal)
  deleteProposal(
    @Arg('proposalPk', () => Int) proposalPk: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.proposal.delete(context.user, { proposalPk });
  }
}

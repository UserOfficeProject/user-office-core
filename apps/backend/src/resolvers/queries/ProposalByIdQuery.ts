import { Arg, Ctx, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Proposal } from '../types/Proposal';
@Resolver()
export class ProposalByIdQuery {
  @Query(() => Proposal, { nullable: true })
  async proposalById(
    @Arg('proposalId', () => String) proposalId: string,
    @Ctx() context: ResolverContext
  ): Promise<Proposal | null> {
    return context.queries.proposal.getProposalById(context.user, proposalId);
  }
}

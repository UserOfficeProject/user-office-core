import { Query, Ctx, Resolver, Arg, Int } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Proposal } from '../types/Proposal';
@Resolver()
export class ProposalQuery {
  @Query(() => Proposal, { nullable: true })
  async proposal(
    @Arg('primaryKey', () => Int) primaryKey: number,
    @Ctx() context: ResolverContext
  ): Promise<Proposal | null> {
    return context.queries.proposal.get(context.user, primaryKey);
  }

  @Query(() => Boolean, { nullable: true })
  async userHasAccessToProposal(
    @Arg('proposalPk', () => Int) proposalPk: number,
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    return context.queries.proposal.get(context.user, proposalPk) !== null;
  }
}

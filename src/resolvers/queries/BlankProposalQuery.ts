import { Arg, Ctx, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Proposal } from '../types/Proposal';

@Resolver()
export class BlankProposalQuery {
  @Query(() => Proposal, { nullable: true })
  blankProposal(
    @Ctx() context: ResolverContext,
    @Arg('callId', () => Int) callId: number
  ) {
    return context.queries.proposal.getBlank(context.user, callId);
  }
}

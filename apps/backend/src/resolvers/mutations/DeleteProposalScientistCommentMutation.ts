import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Proposal } from '../types/Proposal';

@Resolver()
export class DeleteProposalScientistCommentMutation {
  @Mutation(() => Proposal)
  deleteProposalScientistComment(
    @Arg('commentId', () => Int) commentId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.proposal.deleteProposalScientistComment(
      context.user,
      { commentId }
    );
  }
}

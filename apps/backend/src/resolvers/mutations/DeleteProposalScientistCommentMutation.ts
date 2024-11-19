import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalScientistComment } from '../types/ProposalView';

@Resolver()
export class DeleteProposalScientistCommentMutation {
  @Mutation(() => ProposalScientistComment)
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

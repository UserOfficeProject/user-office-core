import { Args, Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalInternalComment } from '../types/ProposalInternalComment';
import { UpdateProposalInternalCommentArgs as UpdateProposalScientistCommentArgs } from '../types/ProposalInternalComment';

@Resolver()
export class UpdateProposalScientistCommentMutation {
  @Mutation(() => ProposalInternalComment)
  updateProposalScientistComment(
    @Args()
    args: UpdateProposalScientistCommentArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.proposal.updateProposalScientistComment(
      context.user,
      args
    );
  }
}

import { Args, ArgsType, Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { UpdateProposalInternalCommentArgs } from '../types/ProposalInternalComment';
import { ProposalScientistComment } from '../types/ProposalView';

@ArgsType()
export class UpdateProposalScientistCommentArgs extends UpdateProposalInternalCommentArgs {}
@Resolver()
export class UpdateProposalScientistCommentMutation {
  @Mutation(() => ProposalScientistComment)
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

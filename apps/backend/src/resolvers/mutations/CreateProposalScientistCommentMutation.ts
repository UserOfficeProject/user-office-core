import { Args, ArgsType, Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { CreateProposalInternalCommentArgs } from '../types/ProposalInternalComment';
import { ProposalScientistComment } from '../types/ProposalView';

@ArgsType()
export class CreateProposalScientistCommentArgs extends CreateProposalInternalCommentArgs {}

@Resolver()
export class CreateProposalScientistCommentMutation {
  @Mutation(() => ProposalScientistComment)
  createProposalScientistComment(
    @Args()
    args: CreateProposalScientistCommentArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.proposal.createProposalScientistComment(
      context.user,
      args
    );
  }
}

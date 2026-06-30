import { Args, ArgsType, Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { CreateProposalInternalCommentArgs } from '../types/ProposalInternalComment';
import { ProposalRejectionComment } from '../types/ProposalView';

@ArgsType()
export class CreateProposalRejectionCommentArgs extends CreateProposalInternalCommentArgs {}

@Resolver()
export class CreateProposalRejectionCommentMutation {
  @Mutation(() => ProposalRejectionComment)
  createProposalRejectionComment(
    @Args()
    args: CreateProposalRejectionCommentArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.proposal.createProposalRejectionComment(
      context.user,
      args
    );
  }
}

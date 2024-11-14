import { Args, Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import {
  CreateProposalInternalCommentArgs as CreateProposalScientistCommentArgs,
  ProposalInternalComment,
} from '../types/ProposalInternalComment';

@Resolver()
export class CreateProposalScientistCommentMutation {
  @Mutation(() => ProposalInternalComment)
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

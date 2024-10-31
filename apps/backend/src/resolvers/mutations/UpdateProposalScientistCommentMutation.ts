import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { Proposal } from '../types/Proposal';

@ArgsType()
export class UpdateProposalScientistCommentArgs {
  @Field(() => Int)
  public proposalPk: number;

  @Field(() => String)
  public commentByScientist: string;
}

@Resolver()
export class UpdateProposalScientistCommentMutation {
  @Mutation(() => Proposal)
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

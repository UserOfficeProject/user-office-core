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
export class NotifyProposalArgs {
  @Field(() => Int)
  public proposalPk: number;
}

@Resolver()
export class NotifyProposalMutation {
  @Mutation(() => Proposal)
  notifyProposal(
    @Args()
    args: NotifyProposalArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.proposal.notify(context.user, {
      proposalPk: args.proposalPk,
    });
  }
}

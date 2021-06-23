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
import { ProposalResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class NotifyProposalArgs {
  @Field(() => Int)
  public proposalPk: number;
}

@Resolver()
export class NotifyProposalMutation {
  @Mutation(() => ProposalResponseWrap)
  notifyProposal(
    @Args()
    args: NotifyProposalArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.proposal.notify(context.user, {
        proposalPk: args.proposalPk,
      }),
      ProposalResponseWrap
    );
  }
}

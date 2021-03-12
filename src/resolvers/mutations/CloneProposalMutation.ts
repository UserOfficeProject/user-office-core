import {
  Ctx,
  Mutation,
  Resolver,
  Arg,
  Int,
  Field,
  InputType,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@InputType()
export class CloneProposalInput {
  @Field(() => Int)
  public callId: number;

  @Field(() => Int)
  public proposalToCloneId: number;
}

@Resolver()
export class CloneProposalMutation {
  @Mutation(() => ProposalResponseWrap)
  cloneProposal(
    @Arg('cloneProposalInput')
    cloneProposalInput: CloneProposalInput,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.proposal.clone(context.user, cloneProposalInput),
      ProposalResponseWrap
    );
  }
}

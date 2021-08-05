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
import { ProposalsResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@InputType()
export class CloneProposalsInput {
  @Field(() => Int)
  public callId: number;

  @Field(() => [Int])
  public proposalsToClonePk: number[];
}

@Resolver()
export class CloneProposalsMutation {
  @Mutation(() => ProposalsResponseWrap)
  async cloneProposals(
    @Arg('cloneProposalsInput')
    cloneProposalsInput: CloneProposalsInput,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.proposal.cloneProposals(
        context.user,
        cloneProposalsInput
      ),
      ProposalsResponseWrap
    );
  }
}

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

export interface CloneProposalInput {
  callId: number;
  proposalToClonePk: number;
}

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
    const result = Promise.all(
      cloneProposalsInput.proposalsToClonePk.map((proposalPk) => {
        return context.mutations.proposal.clone(context.user, {
          callId: cloneProposalsInput.callId,
          proposalToClonePk: proposalPk,
        });
      })
    );

    return wrapResponse(result, ProposalsResponseWrap);
  }
}

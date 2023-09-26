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
import { Proposal } from '../types/Proposal';

@InputType()
export class CloneProposalsInput {
  @Field(() => Int)
  public callId: number;

  @Field(() => [Int])
  public proposalsToClonePk: number[];
}

@Resolver()
export class CloneProposalsMutation {
  @Mutation(() => [Proposal])
  async cloneProposals(
    @Arg('cloneProposalsInput')
    cloneProposalsInput: CloneProposalsInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.proposal.cloneProposals(
      context.user,
      cloneProposalsInput
    );
  }
}

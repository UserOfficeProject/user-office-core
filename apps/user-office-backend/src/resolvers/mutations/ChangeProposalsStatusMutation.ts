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

@InputType()
export class ProposalPkWithCallId {
  @Field(() => Int)
  public primaryKey: number;

  @Field(() => Int)
  public callId: number;
}

@InputType()
export class ChangeProposalsStatusInput {
  @Field(() => Int)
  public statusId: number;

  @Field(() => [ProposalPkWithCallId])
  public proposals: ProposalPkWithCallId[];
}

@Resolver()
export class ChangeProposalsStatusMutation {
  @Mutation(() => Boolean)
  async changeProposalsStatus(
    @Arg('changeProposalsStatusInput')
    changeProposalsStatusInput: ChangeProposalsStatusInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.proposal.changeProposalsStatus(
      context.user,
      changeProposalsStatusInput
    );
  }
}

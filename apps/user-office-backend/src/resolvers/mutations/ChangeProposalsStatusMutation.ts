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
import { isRejection } from '../../models/Rejection';
import { SuccessResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

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
  @Mutation(() => SuccessResponseWrap)
  async changeProposalsStatus(
    @Arg('changeProposalsStatusInput')
    changeProposalsStatusInput: ChangeProposalsStatusInput,
    @Ctx() context: ResolverContext
  ) {
    const res = await context.mutations.proposal.changeProposalsStatus(
      context.user,
      changeProposalsStatusInput
    );

    return wrapResponse(
      isRejection(res) ? Promise.resolve(res) : Promise.resolve(true),
      SuccessResponseWrap
    );
  }
}

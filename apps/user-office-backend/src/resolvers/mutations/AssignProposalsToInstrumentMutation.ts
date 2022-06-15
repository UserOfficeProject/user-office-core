import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Mutation,
  Resolver,
  Int,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { isRejection } from '../../models/Rejection';
import { SuccessResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';
import { ProposalPkWithCallId } from './ChangeProposalsStatusMutation';

@ArgsType()
export class AssignProposalsToInstrumentArgs {
  @Field(() => [ProposalPkWithCallId])
  public proposals: ProposalPkWithCallId[];

  @Field(() => Int)
  public instrumentId: number;
}

@ArgsType()
export class RemoveProposalsFromInstrumentArgs {
  @Field(() => [Int])
  public proposalPks: number[];
}

@Resolver()
export class AssignProposalsToInstrumentMutation {
  @Mutation(() => SuccessResponseWrap)
  async assignProposalsToInstrument(
    @Args() args: AssignProposalsToInstrumentArgs,
    @Ctx() context: ResolverContext
  ) {
    const res = await context.mutations.instrument.assignProposalsToInstrument(
      context.user,
      args
    );

    return wrapResponse(
      isRejection(res) ? Promise.resolve(res) : Promise.resolve(true),
      SuccessResponseWrap
    );
  }

  @Mutation(() => SuccessResponseWrap)
  async removeProposalsFromInstrument(
    @Args() args: RemoveProposalsFromInstrumentArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.instrument.removeProposalsFromInstrument(
        context.user,
        args
      ),
      SuccessResponseWrap
    );
  }
}

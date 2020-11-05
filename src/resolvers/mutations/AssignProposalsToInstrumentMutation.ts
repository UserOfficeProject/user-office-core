import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Mutation,
  Resolver,
  Int,
  InputType,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { isRejection } from '../../rejection';
import { SuccessResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@InputType()
export class ProposalsToInstrumentArgs {
  @Field(() => Int)
  public id: number;

  @Field(() => Int)
  public callId: number;
}

@ArgsType()
export class AssignProposalsToInstrumentArgs {
  @Field(() => [ProposalsToInstrumentArgs])
  public proposals: ProposalsToInstrumentArgs[];

  @Field(() => Int)
  public instrumentId: number;
}

@ArgsType()
export class RemoveProposalsFromInstrumentArgs {
  @Field(() => Int)
  public proposalId: number;

  @Field(() => Int)
  public instrumentId: number;
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
  async removeProposalFromInstrument(
    @Args() args: RemoveProposalsFromInstrumentArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.instrument.removeProposalFromInstrument(
        context.user,
        args
      ),
      SuccessResponseWrap
    );
  }
}

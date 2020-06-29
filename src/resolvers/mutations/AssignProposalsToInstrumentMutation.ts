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
import { SuccessResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class AssignProposalsToInstrumentArgs {
  @Field(() => [Int])
  public proposalIds: number[];

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
    return wrapResponse(
      context.mutations.instrument.assignProposalsToInstrument(
        context.user,
        args
      ),
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

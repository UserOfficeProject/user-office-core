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
  @Mutation(() => Boolean)
  async assignProposalsToInstrument(
    @Args() args: AssignProposalsToInstrumentArgs,
    @Ctx() context: ResolverContext
  ) {
    await context.mutations.instrument.assignProposalsToInstrument(
      context.user,
      args
    );

    return true;
  }

  @Mutation(() => Boolean)
  async removeProposalsFromInstrument(
    @Args() args: RemoveProposalsFromInstrumentArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.instrument.removeProposalsFromInstrument(
      context.user,
      args
    );
  }
}

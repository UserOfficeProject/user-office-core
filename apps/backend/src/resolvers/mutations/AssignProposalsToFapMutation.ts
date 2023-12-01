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
import { Fap } from '../types/Fap';
import { ProposalSelectionInput } from './ChangeProposalsStatusMutation';

@ArgsType()
export class AssignProposalsToFapArgs {
  @Field(() => [ProposalSelectionInput])
  public proposals: ProposalSelectionInput[];

  @Field(() => Int)
  public fapId: number;
}

export class AssignProposalsToFapUsingCallInstrumentArgs {
  @Field(() => [Int])
  public proposalPks: number[];

  @Field(() => Int)
  public instrumentId: number;
}

@ArgsType()
export class RemoveProposalsFromFapArgs {
  @Field(() => [Int])
  public proposalPks: number[];

  @Field(() => Int)
  public fapId: number;
}

@Resolver()
export class AssignProposalsToFapMutation {
  @Mutation(() => Boolean)
  async assignProposalsToFap(
    @Args() args: AssignProposalsToFapArgs,
    @Ctx() context: ResolverContext
  ) {
    const res = await context.mutations.fap.assignProposalsToFap(
      context.user,
      args
    );

    return isRejection(res) ? res : true;
  }

  @Mutation(() => Fap)
  async removeProposalsFromFap(
    @Args() args: RemoveProposalsFromFapArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.fap.removeProposalsFromFap(context.user, args);
  }
}

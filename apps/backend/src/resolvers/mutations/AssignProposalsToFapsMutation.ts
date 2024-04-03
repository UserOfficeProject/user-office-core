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
export class AssignProposalsToFapsArgs {
  @Field(() => [ProposalSelectionInput])
  public proposals: ProposalSelectionInput[];

  @Field(() => [Int])
  public fapIds: number[];

  @Field(() => [Int])
  public fapInstrumentIds: number[];
}

export class AssignProposalsToFapUsingCallInstrumentArgs {
  @Field(() => [Int])
  public proposalPks: number[];

  @Field(() => Int)
  public instrumentId: number;
}

@ArgsType()
export class RemoveProposalsFromFapsArgs {
  @Field(() => [Int])
  public proposalPks: number[];

  @Field(() => [Int])
  public fapIds: number[];
}

@Resolver()
export class AssignProposalsToFapsMutation {
  @Mutation(() => Boolean)
  async assignProposalsToFaps(
    @Args() args: AssignProposalsToFapsArgs,
    @Ctx() context: ResolverContext
  ) {
    const res = await context.mutations.fap.assignProposalsToFaps(
      context.user,
      args
    );

    return isRejection(res) ? res : true;
  }

  @Mutation(() => Fap)
  async removeProposalsFromFaps(
    @Args() args: RemoveProposalsFromFapsArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.fap.removeProposalsFromFaps(context.user, args);
  }
}

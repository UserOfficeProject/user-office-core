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
import { FapProposal } from '../types/FapProposal';
import { FapInstrument } from '../types/ProposalView';

@ArgsType()
export class AssignProposalsToFapsArgs {
  @Field(() => [Int])
  public proposalPks: number[];

  @Field(() => [FapInstrument])
  public fapInstruments: FapInstrument[];
}

export class AssignProposalsToFapsUsingCallInstrumentArgs {
  @Field(() => [Int])
  public proposalPks: number[];

  @Field(() => [Int])
  public instrumentIds: number[];
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

  @Mutation(() => [FapProposal])
  async removeProposalsFromFaps(
    @Args() args: RemoveProposalsFromFapsArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.fap.removeProposalsFromFaps(context.user, args);
  }
}

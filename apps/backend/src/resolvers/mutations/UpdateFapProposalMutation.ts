import {
  Resolver,
  Mutation,
  Ctx,
  Int,
  Field,
  Args,
  ArgsType,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { FapProposal } from '../types/FapProposal';

@ArgsType()
export class UpdateFapTimeAllocationArgs {
  @Field(() => Int)
  fapId: number;

  @Field(() => Int)
  proposalPk: number;

  @Field(() => Int, { nullable: true })
  fapTimeAllocation?: number | null;
}

@Resolver()
export class UpdateFapProposalMutation {
  @Mutation(() => FapProposal)
  async updateFapTimeAllocation(
    @Args(() => UpdateFapTimeAllocationArgs) args: UpdateFapTimeAllocationArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.fap.updateTimeAllocation(context.user, args);
  }
}

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
import { SEPProposal } from '../types/SEPProposal';

@ArgsType()
export class UpdateSEPTimeAllocationArgs {
  @Field(() => Int)
  sepId: number;

  @Field(() => Int)
  proposalPk: number;

  @Field(() => Int, { nullable: true })
  sepTimeAllocation?: number | null;
}

@Resolver()
export class UpdateSEPProposalMutation {
  @Mutation(() => SEPProposal)
  async updateSEPTimeAllocation(
    @Args(() => UpdateSEPTimeAllocationArgs) args: UpdateSEPTimeAllocationArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.sep.updateTimeAllocation(context.user, args);
  }
}

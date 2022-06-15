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
import { SEPProposalResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

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
  @Mutation(() => SEPProposalResponseWrap)
  async updateSEPTimeAllocation(
    @Args(() => UpdateSEPTimeAllocationArgs) args: UpdateSEPTimeAllocationArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sep.updateTimeAllocation(context.user, args),
      SEPProposalResponseWrap
    );
  }
}

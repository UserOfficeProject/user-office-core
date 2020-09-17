import {
  Args,
  ArgsType,
  Ctx,
  Mutation,
  Resolver,
  Field,
  Int,
} from 'type-graphql';

import { ResolverContext } from '../../../context';
import { ProposalStatusResponseWrap } from '../../types/CommonWrappers';
import { wrapResponse } from '../../wrapResponse';

@ArgsType()
export class UpdateProposalStatusArgs {
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public name: string;

  @Field(() => String)
  public description: string;
}

@Resolver()
export class UpdateProposalStatusMutation {
  @Mutation(() => ProposalStatusResponseWrap)
  async updateProposalStatus(
    @Args() args: UpdateProposalStatusArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.proposalSettings.updateProposalStatus(
        context.user,
        args
      ),
      ProposalStatusResponseWrap
    );
  }
}

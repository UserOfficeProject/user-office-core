import { Args, ArgsType, Ctx, Mutation, Resolver, Field } from 'type-graphql';

import { ResolverContext } from '../../../context';
import { ProposalStatusResponseWrap } from '../../types/CommonWrappers';
import { wrapResponse } from '../../wrapResponse';

@ArgsType()
export class CreateProposalStatusArgs {
  @Field(() => String)
  public name: string;

  @Field(() => String)
  public description: string;
}

@Resolver()
export class CreateProposalStatusMutation {
  @Mutation(() => ProposalStatusResponseWrap)
  async createProposalStatus(
    @Args() args: CreateProposalStatusArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.proposalSettings.createProposalStatus(
        context.user,
        args
      ),
      ProposalStatusResponseWrap
    );
  }
}

import { Ctx, Mutation, Resolver, Field, InputType, Arg } from 'type-graphql';

import { ResolverContext } from '../../../context';
import { ProposalStatus } from '../../../models/ProposalStatus';
import { ProposalStatusResponseWrap } from '../../types/CommonWrappers';
import { wrapResponse } from '../../wrapResponse';

@InputType()
export class CreateProposalStatusInput implements Partial<ProposalStatus> {
  @Field(() => String)
  public shortCode: string;

  @Field(() => String)
  public name: string;

  @Field(() => String)
  public description: string;
}

@Resolver()
export class CreateProposalStatusMutation {
  @Mutation(() => ProposalStatusResponseWrap)
  async createProposalStatus(
    @Ctx() context: ResolverContext,
    @Arg('newProposalStatusInput')
    newProposalStatusInput: CreateProposalStatusInput
  ) {
    return wrapResponse(
      context.mutations.proposalSettings.createProposalStatus(
        context.user,
        newProposalStatusInput
      ),
      ProposalStatusResponseWrap
    );
  }
}

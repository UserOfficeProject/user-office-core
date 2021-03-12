import {
  Ctx,
  Mutation,
  Resolver,
  Field,
  Int,
  InputType,
  Arg,
} from 'type-graphql';

import { ResolverContext } from '../../../context';
import { ProposalStatus } from '../../../models/ProposalStatus';
import { ProposalStatusResponseWrap } from '../../types/CommonWrappers';
import { wrapResponse } from '../../wrapResponse';

@InputType()
export class UpdateProposalStatusInput implements ProposalStatus {
  @Field(() => Int)
  public id: number;

  @Field(() => String, { nullable: true })
  public shortCode: string;

  @Field(() => String)
  public name: string;

  @Field(() => String)
  public description: string;

  @Field(() => Boolean, { nullable: true })
  public isDefault: boolean;
}

@Resolver()
export class UpdateProposalStatusMutation {
  @Mutation(() => ProposalStatusResponseWrap)
  async updateProposalStatus(
    @Ctx() context: ResolverContext,
    @Arg('updatedProposalStatusInput')
    updatedProposalStatusInput: UpdateProposalStatusInput
  ) {
    return wrapResponse(
      context.mutations.proposalSettings.updateProposalStatus(
        context.user,
        updatedProposalStatusInput
      ),
      ProposalStatusResponseWrap
    );
  }
}

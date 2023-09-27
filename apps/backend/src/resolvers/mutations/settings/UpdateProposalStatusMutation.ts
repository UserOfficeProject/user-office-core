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
import { ProposalStatus } from '../../types/ProposalStatus';

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
  @Mutation(() => ProposalStatus)
  async updateProposalStatus(
    @Ctx() context: ResolverContext,
    @Arg('updatedProposalStatusInput')
    updatedProposalStatusInput: UpdateProposalStatusInput
  ) {
    return context.mutations.proposalSettings.updateProposalStatus(
      context.user,
      updatedProposalStatusInput
    );
  }
}

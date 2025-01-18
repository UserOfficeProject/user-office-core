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
import { Status } from '../../../models/ProposalStatus';
import { ProposalStatus } from '../../types/ProposalStatus';

@InputType()
export class UpdateStatusInput implements Status {
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

  @Field(() => String)
  public entityType: 'proposal' | 'experiment';
}

@Resolver()
export class UpdateStatusMutation {
  @Mutation(() => ProposalStatus)
  async updateStatus(
    @Ctx() context: ResolverContext,
    @Arg('updatedStatusInput')
    updatedStatusInput: UpdateStatusInput
  ) {
    return context.mutations.status.updateStatus(
      context.user,
      updatedStatusInput
    );
  }
}

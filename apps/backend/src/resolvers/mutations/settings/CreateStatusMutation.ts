import { Ctx, Mutation, Resolver, Field, InputType, Arg } from 'type-graphql';

import { ResolverContext } from '../../../context';
import { WorkflowType } from '../../../models/Workflow';
import { Status } from '../../types/Status';

@InputType()
export class CreateStatusInput implements Partial<Status> {
  @Field(() => String)
  public shortCode: string;

  @Field(() => String)
  public name: string;

  @Field(() => String)
  public description: string;

  @Field(() => WorkflowType)
  public entityType: WorkflowType;
}

@Resolver()
export class CreateStatusMutation {
  @Mutation(() => Status)
  async createStatus(
    @Ctx() context: ResolverContext,
    @Arg('newStatusInput')
    newStatusInput: CreateStatusInput
  ) {
    return context.mutations.status.createStatus(context.user, newStatusInput);
  }
}

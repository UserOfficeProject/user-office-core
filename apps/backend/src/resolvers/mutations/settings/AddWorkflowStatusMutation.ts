import {
  Ctx,
  Mutation,
  Resolver,
  Field,
  InputType,
  Arg,
  Int,
} from 'type-graphql';

import { ResolverContext } from '../../../context';
import { WorkflowConnection } from '../../types/WorkflowConnection';

@InputType()
export class AddWorkflowStatusInput implements Partial<WorkflowConnection> {
  @Field(() => Int)
  public workflowId: number;

  @Field(() => Int)
  public sortOrder: number;

  @Field(() => String)
  public droppableGroupId: string;

  @Field(() => String, { nullable: true })
  public parentDroppableGroupId: string | null;

  @Field(() => Int)
  public statusId: number;

  @Field(() => Int, { nullable: true })
  public nextStatusId: number | null;

  @Field(() => Int, { nullable: true })
  public prevStatusId: number | null;
}

@Resolver()
export class AddWorkflowStatusMutation {
  @Mutation(() => WorkflowConnection)
  async addWorkflowStatus(
    @Ctx() context: ResolverContext,
    @Arg('newWorkflowStatusInput')
    newWorkflowStatusInput: AddWorkflowStatusInput
  ) {
    return context.mutations.workflow.addWorkflowStatus(
      context.user,
      newWorkflowStatusInput
    );
  }
}

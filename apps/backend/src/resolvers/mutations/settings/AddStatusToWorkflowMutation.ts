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
import { WorkflowStatus } from '../../types/WorkflowStatus';

@InputType()
export class AddStatusToWorkflowInput implements Partial<WorkflowConnection> {
  @Field(() => Int)
  public workflowId: number;

  @Field(() => String)
  public statusId: string;

  @Field(() => Int)
  public posX: number;

  @Field(() => Int)
  public posY: number;
}

@Resolver()
export class AddStatusToWorkflowMutation {
  @Mutation(() => WorkflowStatus)
  async addStatusToWorkflow(
    @Ctx() context: ResolverContext,
    @Arg('newWorkflowStatusInput')
    newWorkflowStatusInput: AddStatusToWorkflowInput
  ) {
    return context.mutations.workflow.addStatusToWorkflow(
      context.user,
      newWorkflowStatusInput
    );
  }
}

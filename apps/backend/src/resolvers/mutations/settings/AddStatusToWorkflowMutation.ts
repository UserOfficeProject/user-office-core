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
export class AddStatusToWorkflowInput implements Partial<WorkflowConnection> {
  @Field(() => Int)
  public workflowId: number;

  @Field(() => Int)
  public statusId: number;

  @Field(() => Int)
  public posX: number;

  @Field(() => Int)
  public posY: number;
}

@Resolver()
export class AddStatusToWorkflowMutation {
  @Mutation(() => WorkflowConnection)
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

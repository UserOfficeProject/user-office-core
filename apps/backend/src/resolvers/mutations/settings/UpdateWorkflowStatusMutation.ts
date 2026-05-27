import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../../context';
import { WorkflowStatus } from '../../types/WorkflowStatus';

@InputType()
export class UpdateWorkflowStatusInput {
  @Field(() => Int)
  public workflowStatusId: number;

  @Field(() => Int, { nullable: true })
  public posX?: number;

  @Field(() => Int, { nullable: true })
  public posY?: number;
}

@Resolver()
export class UpdateWorkflowStatusMutation {
  @Mutation(() => WorkflowStatus)
  async updateWorkflowStatus(
    @Ctx() context: ResolverContext,
    @Arg('updateWorkflowStatusInput')
    updateWorkflowStatusInput: UpdateWorkflowStatusInput
  ) {
    return context.mutations.workflow.updateWorkflowStatus(
      context.user,
      updateWorkflowStatusInput
    );
  }
}

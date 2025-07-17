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
export class UpdateWorkflowStatusInput {
  @Field(() => Int)
  public id: number;

  @Field(() => Int, { nullable: true })
  public posX?: number;

  @Field(() => Int, { nullable: true })
  public posY?: number;
}

@Resolver()
export class UpdateWorkflowStatusMutation {
  @Mutation(() => WorkflowConnection)
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

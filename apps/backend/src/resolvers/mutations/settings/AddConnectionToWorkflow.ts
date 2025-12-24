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
export class AddConnectionToWorkflowInput {
  @Field(() => Int)
  public prevWorkflowStatusId: number;

  @Field(() => Int)
  public nextWorkflowStatusId: number;
}

@Resolver()
export class AddConnectionToWorkflowMutation {
  @Mutation(() => WorkflowConnection)
  async addConnectionToWorkflow(
    @Ctx() context: ResolverContext,
    @Arg('newWorkflowConnectionInput')
    newWorkflowConnectionInput: AddConnectionToWorkflowInput
  ) {
    return context.mutations.workflow.addConnectionToWorkflow(
      context.user,
      newWorkflowConnectionInput
    );
  }
}

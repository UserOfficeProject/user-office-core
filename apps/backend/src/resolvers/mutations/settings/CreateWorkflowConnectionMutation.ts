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
export class CreateWorkflowConnectionInput {
  @Field(() => Int)
  public prevWorkflowStatusId: number;

  @Field(() => Int)
  public nextWorkflowStatusId: number;
}

@Resolver()
export class CreateWorkflowConnectionMutation {
  @Mutation(() => WorkflowConnection)
  async createWorkflowConnection(
    @Ctx() context: ResolverContext,
    @Arg('newWorkflowConnectionInput')
    newWorkflowConnectionInput: CreateWorkflowConnectionInput
  ) {
    return context.mutations.workflow.createWorkflowConnection(
      context.user,
      newWorkflowConnectionInput
    );
  }
}

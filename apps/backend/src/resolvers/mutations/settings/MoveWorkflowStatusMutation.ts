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
export class IndexWithGroupId {
  @Field(() => Int)
  public index: number;

  @Field(() => String)
  public droppableId: string;
}

@InputType()
export class MoveWorkflowStatusInput {
  @Field(() => IndexWithGroupId)
  public from: IndexWithGroupId;

  @Field(() => IndexWithGroupId)
  public to: IndexWithGroupId;

  @Field(() => Int)
  public workflowId: number;

  @Field(() => String)
  public entityType: 'proposal' | 'experiment';
}

@Resolver()
export class MoveWorkflowStatusMutation {
  @Mutation(() => WorkflowConnection)
  async moveWorkflowStatus(
    @Ctx() context: ResolverContext,
    @Arg('moveWorkflowStatusInput')
    moveWorkflowStatusInput: MoveWorkflowStatusInput
  ) {
    return context.mutations.workflow.moveWorkflowStatus(
      context.user,
      moveWorkflowStatusInput
    );
  }
}

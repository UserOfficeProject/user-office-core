import { ObjectType, Field, Int } from 'type-graphql';

import { WorkflowStatus as WorkflowStatusOrigin } from '../../models/Workflow';

@ObjectType()
export class WorkflowStatus implements Partial<WorkflowStatusOrigin> {
  @Field(() => Int)
  public id: number;

  @Field(() => Int)
  public workflowId: number;

  @Field(() => Int)
  public statusId: number;

  @Field(() => Int)
  public posX: number;

  @Field(() => Int)
  public posY: number;
}

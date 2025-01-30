import { ObjectType, Field, Int } from 'type-graphql';

import { Status as StatusOrigin } from '../../models/Status';
import { WorkflowType } from '../../models/Workflow';

@ObjectType()
export class Status implements Partial<StatusOrigin> {
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public shortCode: string;

  @Field(() => String)
  public name: string;

  @Field(() => String)
  public description: string;

  @Field(() => Boolean)
  public isDefault: boolean;

  @Field(() => WorkflowType)
  public entityType: WorkflowType;
}

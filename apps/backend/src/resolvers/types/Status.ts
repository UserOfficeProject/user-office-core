import { ObjectType, Field } from 'type-graphql';

import { Status as StatusOrigin } from '../../models/Status';
import { WorkflowType } from '../../models/Workflow';

@ObjectType()
export class Status implements Partial<StatusOrigin> {
  @Field(() => String)
  public id: string;

  @Field(() => String)
  public name: string;

  @Field(() => String)
  public description: string;

  @Field(() => Boolean)
  public isDefault: boolean;

  @Field(() => WorkflowType)
  public entityType: WorkflowType;
}

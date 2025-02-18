import { ObjectType, Field, Int } from 'type-graphql';

import { StatusChangingEvent as StatusChangingEventOrigin } from '../../models/StatusChangingEvent';

@ObjectType()
export class StatusChangingEvent implements StatusChangingEventOrigin {
  @Field(() => Int)
  public statusChangingEventId: number;

  @Field(() => Int)
  public workflowConnectionId: number;

  @Field(() => String)
  public statusChangingEvent: string;
}

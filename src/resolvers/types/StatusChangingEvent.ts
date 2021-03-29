import { ObjectType, Field, Int } from 'type-graphql';

import { Event } from '../../events/event.enum';
import { StatusChangingEvent as StatusChangingEventOrigin } from '../../models/StatusChangingEvent';

@ObjectType()
export class StatusChangingEvent implements StatusChangingEventOrigin {
  @Field(() => Int)
  public statusChangingEventId: number;

  @Field(() => Int)
  public proposalWorkflowConnectionId: number;

  @Field(() => String)
  public statusChangingEvent: string;
}

@ObjectType()
export class ProposalEvent {
  @Field(() => Event)
  public name: Event;

  @Field(() => String, { nullable: true })
  public description: string;
}

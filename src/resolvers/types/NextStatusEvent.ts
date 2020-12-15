import { ObjectType, Field, Int } from 'type-graphql';

import { Event } from '../../events/event.enum';
import { NextStatusEvent as NextStatusEventOrigin } from '../../models/NextStatusEvent';

@ObjectType()
export class NextStatusEvent implements NextStatusEventOrigin {
  @Field(() => Int)
  public nextStatusEventId: number;

  @Field(() => Int)
  public proposalWorkflowConnectionId: number;

  @Field(() => String)
  public nextStatusEvent: string;
}

@ObjectType()
export class ProposalEvent {
  @Field(() => Event)
  public name: Event;

  @Field(() => String)
  public description: string;
}

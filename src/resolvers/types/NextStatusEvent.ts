import { ObjectType, Field, Int } from 'type-graphql';

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

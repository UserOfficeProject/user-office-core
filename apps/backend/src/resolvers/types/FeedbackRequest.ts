import { Field, Int, ObjectType } from 'type-graphql';

import { FeedbackRequest as FeedbackRequestOrigin } from '../../models/FeedbackRequest';

@ObjectType()
export class FeedbackRequest implements Partial<FeedbackRequestOrigin> {
  @Field(() => Int)
  public id: number;

  @Field(() => Int)
  public scheduledEventId: number;

  @Field(() => Date)
  public requestedAt: Date;
}

import { Field, Int, ObjectType } from 'type-graphql';

import { Call as CallOrigin } from '../../models/Call';

@ObjectType()
export class Call implements Partial<CallOrigin> {
  @Field(() => Int)
  public id: number;

  @Field()
  public shortCode: string;

  @Field(() => Date)
  public startCall: Date;

  @Field(() => Date)
  public endCall: Date;

  @Field(() => Date)
  public startReview: Date;

  @Field(() => Date)
  public endReview: Date;

  @Field(() => Date)
  public startNotify: Date;

  @Field(() => Date)
  public endNotify: Date;

  @Field()
  public cycleComment: string;

  @Field()
  public surveyComment: string;

  @Field(() => Int, { nullable: true })
  public templateId?: number;
}

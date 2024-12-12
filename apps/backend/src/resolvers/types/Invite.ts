import { Field, Int, ObjectType } from 'type-graphql';

import { InviteCode as InviteCodeOrigin } from '../../models/InviteCode';

@ObjectType()
export class InviteCode implements Partial<InviteCodeOrigin> {
  @Field(() => Int)
  public id: number;

  @Field()
  public code: string;

  @Field()
  public email: string;

  @Field()
  public note: string;

  @Field()
  public createdAt: Date;

  @Field(() => Int)
  public createdByUserId: number;

  @Field(() => Date, { nullable: true })
  public claimedAt: Date | null;

  @Field(() => Int, { nullable: true })
  public claimedByUserId: number | null;
}

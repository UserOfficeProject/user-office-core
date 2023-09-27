import { ObjectType, Field, Int } from 'type-graphql';

import { RedeemCode as RedeemCodeOrigin } from '../../models/RedeemCode';

@ObjectType()
export class RedeemCode implements Partial<RedeemCodeOrigin> {
  @Field(() => String)
  public code: string;

  @Field(() => Int)
  public placeholderUserId: number;

  @Field(() => Int)
  public createdBy: number;

  @Field(() => Date)
  public createdAt: Date;

  @Field(() => Date, { nullable: true })
  public claimedAt: Date | null;
}

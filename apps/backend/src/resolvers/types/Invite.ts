import { Field, Int, ObjectType } from 'type-graphql';

import { Invite as InviteOrigin } from '../../models/Invite';

@ObjectType()
export class Invite implements Partial<InviteOrigin> {
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

  @Field(() => Int)
  public isEmailSent: boolean;
}

import { ObjectType, Field, Int } from 'type-graphql';

import { UserJWT as UserJWTOrigin } from '../../models/User';

@ObjectType()
export class UserJWT implements Partial<UserJWTOrigin> {
  @Field(() => Int)
  public id: number;

  @Field()
  public firstname: string;

  @Field()
  public lastname: string;

  @Field(() => String, { nullable: true })
  public preferredname: string | null;

  @Field(() => String, { nullable: true })
  public email: string | null;

  @Field(() => String, { nullable: true })
  public oidcSub: string | null;

  @Field(() => Boolean, { nullable: true })
  public placeholder: boolean | null;

  @Field()
  public created: string;

  @Field()
  public position: string;

  @Field(() => Int, { nullable: true })
  public institutionId: number | null;
}

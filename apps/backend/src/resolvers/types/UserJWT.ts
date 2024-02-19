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
  public preferredname: string | undefined;

  @Field()
  public email: string;

  @Field(() => String, { nullable: true })
  public oidcSub: string | null;

  @Field()
  public placeholder: boolean;

  @Field()
  public created: string;

  @Field()
  public position: string;

  @Field()
  public institutionId: number;
}

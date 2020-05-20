import { ObjectType, Field, Int } from 'type-graphql';

import { BasicUserDetails as BasicUserDetailsOrigin } from '../../models/User';

@ObjectType()
export class BasicUserDetails implements Partial<BasicUserDetailsOrigin> {
  @Field(() => Int)
  public id: number;

  @Field()
  public firstname: string;

  @Field()
  public lastname: string;

  @Field()
  public organisation: string;

  @Field()
  public position: string;

  @Field(() => Boolean, { nullable: true })
  public placeholder?: boolean;

  @Field(() => Date, { nullable: true })
  public created?: Date;
}

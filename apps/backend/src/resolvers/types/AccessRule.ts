import { ObjectType, Field, Int } from 'type-graphql';

@ObjectType()
export class AccessRule {
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public role: string;

  @Field(() => Int)
  public role_id: number;

  @Field(() => String)
  public subject: string;

  @Field(() => String)
  public action: string;

  @Field({ nullable: true })
  public conditions: string;
}
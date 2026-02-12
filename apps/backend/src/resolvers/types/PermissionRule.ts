import { ObjectType, Field, Int } from 'type-graphql';

@ObjectType()
export class PermissionRule {
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public role: string;

  @Field(() => String)
  public subject: string;

  @Field(() => String)
  public action: string;

  @Field({ nullable: true })
  public conditions: string;
}
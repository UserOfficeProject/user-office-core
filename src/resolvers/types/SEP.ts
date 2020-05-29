import { ObjectType, Field, Int } from 'type-graphql';

@ObjectType()
export class SEP {
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public code: string;

  @Field(() => String)
  public description: string;

  @Field(() => Number)
  public numberRatingsRequired: number;

  @Field(() => Boolean)
  public active: boolean;
}

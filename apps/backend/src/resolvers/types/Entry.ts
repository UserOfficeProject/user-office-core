import { Field, ObjectType, Int } from 'type-graphql';

@ObjectType()
export class Entry {
  @Field(() => Int)
  id: number;

  @Field()
  value: string;
}

import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class MultiPartSelectionPair {
  @Field(() => String)
  key: string;

  @Field(() => [String])
  value: string[];
}

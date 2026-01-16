import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class CallAccess {
  @Field(() => Boolean)
  public canArchive: boolean;
}

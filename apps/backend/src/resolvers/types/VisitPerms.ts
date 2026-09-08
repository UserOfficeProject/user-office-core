import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class VisitPerms {
  @Field(() => Boolean)
  public readable: boolean;

  @Field(() => Boolean)
  public writeable: boolean;

  @Field(() => Boolean)
  public createable: boolean;
}

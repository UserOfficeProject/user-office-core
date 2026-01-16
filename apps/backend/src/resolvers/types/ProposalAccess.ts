import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class ProposalAccess {
  @Field(() => Boolean)
  public canDelete: boolean;
}

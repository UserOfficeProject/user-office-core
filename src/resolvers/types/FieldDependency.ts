import { ObjectType, Field } from "type-graphql";

import { FieldDependency as FieldDependencyOrigin } from "../../models/ProposalModel";

@ObjectType()
export class FieldDependency implements Partial<FieldDependencyOrigin> {
  @Field()
  public proposal_question_id: string;

  @Field()
  public proposal_question_dependency: string;
  //public condition: FieldCondition

  @Field(() => String, { nullable: true })
  public condition: string; // TODO SWAP-341. strongly type this after making GraphQL able to return more custom objects
}

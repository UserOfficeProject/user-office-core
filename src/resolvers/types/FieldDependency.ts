import { ObjectType, Field } from "type-graphql";

import { FieldDependency as FieldDependencyOrigin } from "../../models/ProposalModel";
import { FieldCondition } from "./FieldCondition";

@ObjectType()
export class FieldDependency implements Partial<FieldDependencyOrigin> {
  @Field()
  public proposal_question_id: string;

  @Field()
  public proposal_question_dependency: string;

  @Field(() => FieldCondition)
  public condition: FieldCondition;
}

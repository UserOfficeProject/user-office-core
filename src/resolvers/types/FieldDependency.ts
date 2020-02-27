import { ObjectType, Field } from "type-graphql";

import { FieldDependency as FieldDependencyOrigin } from "../../models/ProposalModel";
import { FieldCondition } from "./FieldCondition";

@ObjectType()
export class FieldDependency implements Partial<FieldDependencyOrigin> {
  @Field()
  public question_id: string;

  @Field()
  public dependency_id: string;

  @Field()
  public dependency_natural_key: string;

  @Field(() => FieldCondition)
  public condition: FieldCondition;
}

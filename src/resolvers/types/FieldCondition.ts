import { Field, ObjectType } from "type-graphql";
import { EvaluatorOperator } from "../../models/ConditionEvaluator";

@ObjectType()
export class FieldCondition {
  @Field(() => EvaluatorOperator)
  public condition: EvaluatorOperator;

  @Field()
  public params: string;
}

import { Field, ObjectType } from "type-graphql";
import { EvaluatorOperator } from "../../models/ConditionEvaluator";
import { IntStringDateBool } from "../CustomScalars";

@ObjectType()
export class FieldCondition {
  @Field(() => EvaluatorOperator)
  public condition: EvaluatorOperator;

  @Field(() => IntStringDateBool)
  public params: any;
}

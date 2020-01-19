import { Field, ObjectType } from "type-graphql";
import { EvaluatorOperator } from "../../models/ConditionEvaluator";

@ObjectType()
export class FieldCondition {
  @Field(() => EvaluatorOperator, { nullable: true })
  public condition: EvaluatorOperator;

  @Field({ nullable: true })
  public params: string;
}

import { Field, ObjectType } from 'type-graphql';

import { EvaluatorOperator } from '../../models/ConditionEvaluator';
import { IntStringDateBoolArray } from '../CustomScalars';

@ObjectType()
export class FieldCondition {
  @Field(() => EvaluatorOperator)
  public condition: EvaluatorOperator;

  @Field(() => IntStringDateBoolArray)
  public params: any;
}

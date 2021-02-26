import { EvaluatorOperator, Answer, DataType } from 'generated/sdk';

export class EqualityValidator implements FieldConditionEvaluator {
  isSatisfied(field: Answer, params: string): boolean {
    // NOTE: Check against array of values when multichoice field dependency.
    if (field.question.dataType === DataType.SELECTION_FROM_OPTIONS) {
      return field.value.includes(params);
    }

    return field.value === params;
  }
}

export class InequalityValidator implements FieldConditionEvaluator {
  isSatisfied(field: Answer, params: string): boolean {
    // NOTE: Check against array of values when multichoice field dependency.
    if (field.question.dataType === DataType.SELECTION_FROM_OPTIONS) {
      return field.value?.length && !field.value.includes(params);
    }

    return field.value !== params;
  }
}

export class ConditionEvaluator {
  private validatorMap!: Map<EvaluatorOperator, FieldConditionEvaluator>;

  private getMappings() {
    if (!this.validatorMap) {
      // lazy initialization
      this.validatorMap = new Map<EvaluatorOperator, FieldConditionEvaluator>();
      this.validatorMap.set(EvaluatorOperator.EQ, new EqualityValidator());
      this.validatorMap.set(EvaluatorOperator.NEQ, new InequalityValidator());
    }

    return this.validatorMap;
  }

  getConditionEvaluator(id: EvaluatorOperator): FieldConditionEvaluator {
    return this.getMappings().get(id) as FieldConditionEvaluator;
  }
}

export interface FieldConditionEvaluator {
  isSatisfied(field: Answer, params: string): boolean;
}

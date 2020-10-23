import { EvaluatorOperator, Answer } from 'generated/sdk';

export class EqualityValidator implements FieldConditionEvaluator {
  isSatisfied(field: Answer, params: string): boolean {
    return field.value === params;
  }
}

export class InequalityValidator implements FieldConditionEvaluator {
  isSatisfied(field: Answer, params: string): boolean {
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
    return this.getMappings().get(id)!;
  }
}

export interface FieldConditionEvaluator {
  isSatisfied(field: Answer, params: string): boolean;
}

import { Answer } from './Questionary';

export enum EvaluatorOperator {
  eq = 'eq',
  neq = 'neq',
}

export enum DependenciesLogicOperator {
  AND = 'AND',
  OR = 'OR',
}

export class EqualityValidator implements FieldConditionEvaluator {
  isSatisfied(answer: Answer, params: Record<string, unknown>): boolean {
    return new String(answer.value).valueOf() === new String(params).valueOf();
  }
}

export class InequalityValidator implements FieldConditionEvaluator {
  isSatisfied(answer: Answer, params: Record<string, unknown>): boolean {
    return answer.value !== params;
  }
}

export class ConditionEvaluator {
  private validatorMap!: Map<EvaluatorOperator, FieldConditionEvaluator>;

  private getMappings() {
    if (!this.validatorMap) {
      // lazy initialization
      this.validatorMap = new Map<EvaluatorOperator, FieldConditionEvaluator>();
      this.validatorMap.set(EvaluatorOperator.eq, new EqualityValidator());
      this.validatorMap.set(EvaluatorOperator.neq, new InequalityValidator());
    }

    return this.validatorMap;
  }

  getConditionEvaluator(id: EvaluatorOperator): FieldConditionEvaluator {
    return this.getMappings().get(id) as FieldConditionEvaluator;
  }
}

export interface FieldConditionEvaluator {
  isSatisfied(answer: Answer, params: Record<string, unknown>): boolean;
}

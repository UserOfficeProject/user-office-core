import JSDict from '../utils/Dictionary';
import { Answer } from './ProposalModel';

export enum EvaluatorOperator {
  EQ = 'EQ',
  NEQ = 'NEQ',
}

export class EqualityValidator implements FieldConditionEvaluator {
  isSatisfied(answer: Answer, params: object): boolean {
    return answer.value === params;
  }
}

export class InequalityValidator implements FieldConditionEvaluator {
  isSatisfied(answer: Answer, params: object): boolean {
    return answer.value !== params;
  }
}

export class ConditionEvaluator {
  private validatorMap!: JSDict<EvaluatorOperator, FieldConditionEvaluator>;

  private getMappings() {
    if (!this.validatorMap) {
      // lazy initialization
      this.validatorMap = JSDict.Create<
        EvaluatorOperator,
        FieldConditionEvaluator
      >();
      this.validatorMap.put(EvaluatorOperator.EQ, new EqualityValidator());
      this.validatorMap.put(EvaluatorOperator.NEQ, new InequalityValidator());
    }

    return this.validatorMap;
  }

  getConditionEvaluator(id: EvaluatorOperator): FieldConditionEvaluator {
    return this.getMappings().get(id) as FieldConditionEvaluator;
  }
}

export interface FieldConditionEvaluator {
  isSatisfied(answer: Answer, params: object): boolean;
}

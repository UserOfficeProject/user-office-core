import JSDict from '../utils/Dictionary';
import { QuestionaryField } from './ProposalModel';

export enum EvaluatorOperator {
  EQ = 'EQ',
  NEQ = 'NEQ',
}

export class EqualityValidator implements FieldConditionEvaluator {
  isSatisfied(field: QuestionaryField, params: object): boolean {
    return field.value === params;
  }
}

export class InequalityValidator implements FieldConditionEvaluator {
  isSatisfied(field: QuestionaryField, params: object): boolean {
    return field.value !== params;
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
  isSatisfied(field: QuestionaryField, params: object): boolean;
}

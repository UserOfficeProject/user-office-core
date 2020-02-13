import JSDict from "../utils/Dictionary";
import { EvaluatorOperator, QuestionaryField } from "../generated/sdk";

export class ConditionEvaluator {
  private validatorMap!: JSDict<EvaluatorOperator, IFieldConditionEvaluator>;

  private getMappings() {
    if (!this.validatorMap) {
      // lazy initialization
      this.validatorMap = JSDict.Create<
        EvaluatorOperator,
        IFieldConditionEvaluator
      >();
      this.validatorMap.put(EvaluatorOperator.EQ, new EqualityValidator());
      this.validatorMap.put(EvaluatorOperator.NEQ, new InequalityValidator());
    }
    return this.validatorMap;
  }

  getConditionEvaluator(id: EvaluatorOperator): IFieldConditionEvaluator {
    return this.getMappings().get(id)!;
  }
}

export interface IFieldConditionEvaluator {
  isSatisfied(field: QuestionaryField, params: string): boolean;
}

export class EqualityValidator implements IFieldConditionEvaluator {
  isSatisfied(field: QuestionaryField, params: string): boolean {
    return field.value === params;
  }
}

export class InequalityValidator implements IFieldConditionEvaluator {
  isSatisfied(field: QuestionaryField, params: string): boolean {
    return field.value !== params;
  }
}

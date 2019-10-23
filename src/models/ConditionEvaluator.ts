import JSDict from "../utils/Dictionary";
import { QuestionaryField } from "./ProposalModel";

export enum EvaluatorOperator {
  EQ = "eq",
  NEQ = "neq"
}

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

  getConfitionEvaluator(id: EvaluatorOperator): IFieldConditionEvaluator {
    return this.getMappings().get(id)!;
  }
}

export interface IFieldConditionEvaluator {
  isSattisfied(field: QuestionaryField, params: object): boolean;
}

export class EqualityValidator implements IFieldConditionEvaluator {
  isSattisfied(field: QuestionaryField, params: object): boolean {
    return field.value === params;
  }
}

export class InequalityValidator implements IFieldConditionEvaluator {
  isSattisfied(field: QuestionaryField, params: object): boolean {
    return field.value !== params;
  }
}

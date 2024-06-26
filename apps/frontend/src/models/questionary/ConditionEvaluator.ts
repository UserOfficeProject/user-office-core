import { EvaluatorOperator, Answer, DataType } from 'generated/sdk';

const equalityForInstrumentPicker = (field: Answer, params: string) => {
  if (Array.isArray(field.value)) {
    const ids = field.value.map(
      (e: { instrumentId: string; timeREquested: string }) => e?.instrumentId
    );

    return ids.includes(params.toString());
  } else {
    const v: { instrumentId: string; timeREquested: string } = field.value;

    return v?.instrumentId === params.toString();
  }
};

export class EqualityValidator implements FieldConditionEvaluator {
  isSatisfied(field: Answer, params: string): boolean {
    // NOTE: Check against array of values when multichoice field dependency.
    if (field.question.dataType === DataType.SELECTION_FROM_OPTIONS) {
      return field.value.includes(params);
    }
    if (field.question.dataType === DataType.INSTRUMENT_PICKER) {
      return equalityForInstrumentPicker(field, params);
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
    if (field.question.dataType === DataType.INSTRUMENT_PICKER) {
      return !equalityForInstrumentPicker(field, params);
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

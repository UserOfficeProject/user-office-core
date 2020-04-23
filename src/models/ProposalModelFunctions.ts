import {
  SelectionFromOptionsConfig,
  TextInputConfig,
} from '../resolvers/types/FieldConfig';
import JSDict from '../utils/Dictionary';
import { ConditionEvaluator } from './ConditionEvaluator';
import {
  Answer,
  DataType,
  DataTypeSpec,
  FieldDependency,
  QuestionaryStep,
  QuestionRel,
  TemplateStep,
} from './ProposalModel';
type AbstractField = QuestionRel | Answer;
type AbstractCollection = TemplateStep[] | QuestionaryStep[];
export function getDataTypeSpec(type: DataType): DataTypeSpec {
  switch (type) {
    case DataType.EMBELLISHMENT:
      return { readonly: true };
    default:
      return { readonly: false };
  }
}
export function getTopicById(collection: AbstractCollection, topicId: number) {
  const step = collection.find(step => step.topic.topic_id === topicId);

  return step ? step.topic : undefined;
}
export function getQuestionaryStepByTopicId(
  collection: AbstractCollection,
  topicId: number
) {
  return collection.find(step => step.topic.topic_id === topicId);
}
export function getFieldById(
  collection: AbstractCollection,
  questionId: string
) {
  let needle: AbstractField | undefined;
  collection.every(step => {
    needle = step.fields.find(
      field => field.question.proposalQuestionId === questionId
    );

    return needle === undefined;
  });

  return needle;
}
export function getAllFields(collection: AbstractCollection) {
  let allFields = new Array<AbstractField>();
  collection.forEach(step => {
    allFields = allFields.concat(step.fields);
  });

  return allFields;
}
export function isDependencySatisfied(
  collection: QuestionaryStep[],
  dependency: FieldDependency | undefined
): boolean {
  if (!dependency?.condition) {
    return true;
  }
  const { condition, params } = dependency.condition;
  const field = getFieldById(collection, dependency.dependencyId) as
    | Answer
    | undefined;
  if (!field) {
    return true;
  }
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const isParentSatisfied = areDependenciesSatisfied(
    collection,
    dependency.dependencyId
  );

  return (
    isParentSatisfied &&
    new ConditionEvaluator()
      .getConditionEvaluator(condition)
      .isSatisfied(field, params)
  );
}
export function areDependenciesSatisfied(
  questionary: QuestionaryStep[],
  fieldId: string
) {
  const field = getFieldById(questionary, fieldId);
  if (!field) {
    return true;
  }

  return isDependencySatisfied(questionary, field.dependency);
}

class BaseValidator implements ConstraintValidator {
  constructor(private dataType?: DataType | undefined) {}

  validate(value: any, field: Answer) {
    if (this.dataType && field.question.dataType !== this.dataType) {
      throw new Error('Field validator ');
    }
    if (field.question.config.required && !value) {
      return false;
    }

    return true;
  }
}

class TextInputValidator extends BaseValidator {
  constructor() {
    super(DataType.TEXT_INPUT);
  }
  validate(value: any, field: Answer) {
    if (!super.validate(value, field)) {
      return false;
    }
    const config = field.question.config as TextInputConfig;
    if (config.min && value && value.length < config.min) {
      return false;
    }
    if (config.max && value && value.length > config.max) {
      return false;
    }

    return true;
  }
}

class SelectFromOptionsInputValidator extends BaseValidator {
  constructor() {
    super(DataType.SELECTION_FROM_OPTIONS);
  }
  validate(value: any, field: Answer) {
    const config = field.question.config as SelectionFromOptionsConfig;
    if (!super.validate(value, field)) {
      return false;
    }

    if (config.required && config.options!.indexOf(value) === -1) {
      return false;
    }

    return true;
  }
}

const validatorMap = JSDict.Create<DataType, ConstraintValidator>();
validatorMap.put(DataType.TEXT_INPUT, new TextInputValidator());
validatorMap.put(
  DataType.SELECTION_FROM_OPTIONS,
  new SelectFromOptionsInputValidator()
);

export function isMatchingConstraints(value: any, field: QuestionRel): boolean {
  const val = JSON.parse(value).value;
  const validator =
    validatorMap.get(field.question.dataType) || new BaseValidator();

  return validator.validate(val, field);
}

interface ConstraintValidator {
  validate(value: any, field: QuestionRel): boolean;
}

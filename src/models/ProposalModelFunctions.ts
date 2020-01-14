import { ConditionEvaluator } from "./ConditionEvaluator";
import {
  ProposalTemplateField,
  QuestionaryField,
  ProposalTemplate,
  Questionary,
  DataType,
  DataTypeSpec,
  FieldDependency,
  FieldConfig,
  TextInputConfig,
  SelectionFromOptionsConfig
} from "./ProposalModel";
import JSDict from "../utils/Dictionary";
type AbstractField = ProposalTemplateField | QuestionaryField;
type AbstractCollection = ProposalTemplate | Questionary;
export function getDataTypeSpec(type: DataType): DataTypeSpec {
  switch (type) {
    case DataType.EMBELLISHMENT:
      return { readonly: true };
    default:
      return { readonly: false };
  }
}
export function getTopicById(collection: AbstractCollection, topicId: number) {
  const step = collection.steps.find(step => step.topic.topic_id === topicId);
  return step ? step.topic : undefined;
}
export function getQuestionaryStepByTopicId(
  template: AbstractCollection,
  topicId: number
) {
  return template.steps.find(step => step.topic.topic_id === topicId);
}
export function getFieldById(
  collection: AbstractCollection,
  questionId: string
) {
  let needle: AbstractField | undefined;
  collection.steps.every(step => {
    needle = step.fields.find(
      field => field.proposal_question_id === questionId
    );
    return needle === undefined;
  });
  return needle;
}
export function getAllFields(collection: AbstractCollection) {
  let allFields = new Array<AbstractField>();
  collection.steps.forEach(step => {
    allFields = allFields.concat(step.fields);
  });
  return allFields;
}
export function isDependencySatisfied(
  collection: Questionary,
  dependency: FieldDependency
): boolean {
  //const { condition, params } = dependency.condition;
  const { condition, params } = JSON.parse(dependency.condition); // TODO SWAP-341. strongly type this after making GraphQL able to return more custom objects
  const field = getFieldById(
    collection,
    dependency.proposal_question_dependency
  ) as QuestionaryField | undefined;
  if (!field) {
    return true;
  }
  const isParentSattisfied = areDependenciesSatisfied(
    collection,
    dependency.proposal_question_dependency
  );
  return (
    isParentSattisfied &&
    new ConditionEvaluator()
      .getConfitionEvaluator(condition)
      .isSattisfied(field, params)
  );
}
export function areDependenciesSatisfied(
  questionary: Questionary,
  fieldId: string
) {
  const field = getFieldById(questionary, fieldId);
  if (!field) {
    return true;
  }
  const isAtLeastOneDissasisfied = field.dependencies!.some(dep => {
    let result = isDependencySatisfied(questionary, dep) === false;
    return result;
  });
  return isAtLeastOneDissasisfied === false;
}

export function isMatchingConstraints(
  value: any,
  field: ProposalTemplateField
): boolean {
  const val = JSON.parse(value).value;
  const validator = validatorMap.get(field.data_type) || new BaseValidator();
  return validator.validate(val, field);
}

interface IConstraintValidator {
  validate(value: any, field: ProposalTemplateField): boolean;
}

class BaseValidator implements IConstraintValidator {
  constructor(private dataType?: DataType | undefined) {}

  validate(value: any, field: QuestionaryField) {
    if (this.dataType && field.data_type !== this.dataType) {
      throw new Error("Field validator ");
    }
    if (field.config.required && !value) {
      return false;
    }
    return true;
  }
}

class TextInputValidator extends BaseValidator {
  constructor() {
    super(DataType.TEXT_INPUT);
  }
  validate(value: any, field: QuestionaryField) {
    if (!super.validate(value, field)) {
      return false;
    }
    const config = field.config as TextInputConfig;
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
  validate(value: any, field: QuestionaryField) {
    const config = field.config as SelectionFromOptionsConfig;
    if (!super.validate(value, field)) {
      return false;
    }

    if (config.required && config.options!.indexOf(value) === -1) {
      return false;
    }

    return true;
  }
}

const validatorMap = JSDict.Create<DataType, IConstraintValidator>();
validatorMap.put(DataType.TEXT_INPUT, new TextInputValidator());
validatorMap.put(
  DataType.SELECTION_FROM_OPTIONS,
  new SelectFromOptionsInputValidator()
);

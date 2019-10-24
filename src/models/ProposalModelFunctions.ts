import { ConditionEvaluator } from "./ConditionEvaluator";
import {
  ProposalTemplateField,
  QuestionaryField,
  ProposalTemplate,
  Questionary,
  DataType,
  DataTypeSpec,
  FieldDependency
} from "./ProposalModel";
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
  const { condition, params } = dependency.condition;
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

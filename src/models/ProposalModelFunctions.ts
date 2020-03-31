// FIXME: This should be fixed for sure. It produces compile errors and ts-ignore should never be used.
/* eslint-disable @typescript-eslint/ban-ts-ignore */
import {
  DataType,
  FieldDependency,
  ProposalTemplate,
  ProposalTemplateField,
  Questionary,
  QuestionaryField,
  TemplateStep,
  QuestionaryStep,
} from '../generated/sdk';
import { ConditionEvaluator } from './ConditionEvaluator';
import { DataTypeSpec } from './ProposalModel';

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
  // @ts-ignore-line
  const step = collection.steps.find(step => step.topic.topic_id === topicId);

  return step ? step.topic : undefined;
}
export function getQuestionaryStepByTopicId(
  template: AbstractCollection,
  topicId: number
): any {
  // @ts-ignore-line
  return template.steps.find(step => step.topic.topic_id === topicId);
}

export function getFieldById(
  collection: AbstractCollection,
  questionId: string
): ProposalTemplateField | QuestionaryField | undefined {
  let needle: AbstractField | undefined;

  collection.steps.every((step: any) => {
    needle = step.fields.find(
      (field: any) => field.proposal_question_id === questionId
    );

    return needle === undefined;
  });

  return needle;
}

export function getAllFields(collection: AbstractCollection): AbstractField[] {
  let allFields = new Array<AbstractField>();
  collection.steps.forEach((step: TemplateStep | QuestionaryStep) => {
    allFields = allFields.concat(step.fields);
  });

  return allFields;
}

export function isDependencySatisfied(
  collection: Questionary,
  dependency: FieldDependency
): boolean {
  const { condition, params } = dependency.condition;
  const field = getFieldById(collection, dependency.dependency_id) as
    | QuestionaryField
    | undefined;
  if (!field) {
    return true;
  }
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const isParentSatisfied = areDependenciesSatisfied(
    collection,
    dependency.dependency_id
  );

  return (
    isParentSatisfied &&
    new ConditionEvaluator()
      .getConditionEvaluator(condition)
      .isSatisfied(field, params)
  );
}

export function areDependenciesSatisfied(
  questionary: Questionary,
  fieldId: string
): boolean {
  const field = getFieldById(questionary, fieldId);
  if (!field) {
    return true;
  }
  const isAtLeastOneDissatisfied = field.dependencies?.some(dep => {
    const result = isDependencySatisfied(questionary, dep) === false;

    return result;
  });

  return isAtLeastOneDissatisfied === false;
}

// FIXME: This should be fixed for sure. It produces compile errors and ts-ignore should never be used.
/* eslint-disable @typescript-eslint/ban-ts-ignore */
import {
  Answer,
  DataType,
  FieldDependency,
  QuestionaryStep,
  QuestionTemplateRelation,
  TemplateStep,
} from '../generated/sdk';
import { ConditionEvaluator } from './ConditionEvaluator';
import { DataTypeSpec } from './ProposalModel';

type AbstractField = QuestionTemplateRelation | Answer;
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
  // @ts-ignore-line
  const step = collection.find(step => step.topic.id === topicId);

  return step ? step.topic : undefined;
}

export function getQuestionaryStepByTopicId(
  collection: AbstractCollection,
  topicId: number
) {
  // @ts-ignore-line
  return collection.find(step => step.topic.id === topicId);
}

export function getFieldById(
  collection: AbstractCollection,
  questionId: string
) {
  let needle: AbstractField | undefined;
  // @ts-ignore-line
  collection.every(step => {
    needle = step.fields.find(
      // @ts-ignore-line
      field => field.question.proposalQuestionId === questionId
    );

    return needle === undefined;
  });

  return needle;
}

export function getAllFields(collection: AbstractCollection) {
  let allFields = new Array<AbstractField>();
  // @ts-ignore-line
  collection.forEach(step => {
    allFields = allFields.concat(step.fields);
  });

  return allFields;
}

export function isDependencySatisfied(
  collection: QuestionaryStep[],
  dependency: FieldDependency | undefined | null
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

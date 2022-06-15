import { ConditionEvaluator } from './ConditionEvaluator';
import { Answer, QuestionaryStep } from './Questionary';
import { getQuestionDefinition } from './questionTypes/QuestionRegistry';
import {
  FieldDependency,
  QuestionTemplateRelation,
  TemplateStep,
} from './Template';
type AbstractField = QuestionTemplateRelation | Answer;
type AbstractCollection = TemplateStep[] | QuestionaryStep[];

export function getTopicById(collection: AbstractCollection, topicId: number) {
  const step = collection.find((step) => step.topic.id === topicId);

  return step ? step.topic : undefined;
}
export function getQuestionaryStepByTopicId(
  collection: AbstractCollection,
  topicId: number
) {
  return collection.find((step) => step.topic.id === topicId);
}
export function getFieldById(
  collection: AbstractCollection,
  questionId: string
) {
  let needle: AbstractField | undefined;
  collection.every((step) => {
    needle = step.fields.find((field) => field.question.id === questionId);

    return needle === undefined;
  });

  return needle;
}
export function getAllFields(collection: AbstractCollection) {
  let allFields = new Array<AbstractField>();
  collection.forEach((step) => {
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

  if (!field || !field.dependencies) {
    return true;
  }

  return field.dependencies.every((dependency) =>
    isDependencySatisfied(questionary, dependency)
  );
}

export async function isMatchingConstraints(
  questionTemplateRelation: QuestionTemplateRelation,
  value: any
): Promise<boolean> {
  const definition = getQuestionDefinition(
    questionTemplateRelation.question.dataType
  );

  if (!definition.validate) {
    return true;
  }

  return definition.validate(questionTemplateRelation, value);
}

export function transformAnswerValueIfNeeded(
  questionTemplateRelation: QuestionTemplateRelation,
  value: any
) {
  const definition = getQuestionDefinition(
    questionTemplateRelation.question.dataType
  );

  if (!definition.transform) {
    return undefined;
  }

  return definition.transform(questionTemplateRelation, value);
}

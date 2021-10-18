import { getQuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';
import {
  Answer,
  AnswerInput,
  DataType,
  DependenciesLogicOperator,
  FieldDependency,
  QuestionaryStep,
  QuestionTemplateRelation,
  TemplateStep,
} from 'generated/sdk';

import { ConditionEvaluator } from './ConditionEvaluator';

export type AbstractField = QuestionTemplateRelation | Answer;
type AbstractCollection = Array<TemplateStep | QuestionaryStep>;

export function getTopicById(collection: AbstractCollection, topicId: number) {
  const step = collection.find((step) => step.topic.id === topicId);

  return step ? step : undefined;
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
    needle = (step.fields as Array<QuestionTemplateRelation | Answer>).find(
      (field) => field.question.id === questionId
    );

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
  if (!field || !field.dependencies) {
    return true;
  }

  if (field.dependenciesOperator === DependenciesLogicOperator.OR) {
    return field.dependencies.some((dependency) =>
      isDependencySatisfied(questionary, dependency)
    );
  } else {
    return field.dependencies.every((dependency) =>
      isDependencySatisfied(questionary, dependency)
    );
  }
}

export function prepareAnswers(answers?: Answer[]): AnswerInput[] {
  if (answers) {
    answers = answers.filter((answer) => {
      const definition = getQuestionaryComponentDefinition(
        answer.question.dataType
      );

      return !definition.readonly;
    });

    answers = answers.map((answer) => {
      const { preSubmitTransform } = getQuestionaryComponentDefinition(
        answer.question.dataType
      );

      return preSubmitTransform ? preSubmitTransform(answer) : answer;
    });

    const preparedAnswers = answers.map((answer) => {
      return {
        questionId: answer.question.id,
        value: JSON.stringify({ value: answer.value }),
      }; // store value in JSON to preserve datatype e.g. { "value":74 } or { "value":"yes" } . Because of GraphQL limitations
    });

    return preparedAnswers;
  } else {
    return [];
  }
}

export function getQuestionsByType(
  collection: AbstractCollection,
  type: DataType
) {
  return getAllFields(collection).filter(
    (field) => field.question.dataType === type
  );
}

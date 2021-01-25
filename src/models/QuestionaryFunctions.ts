/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { getQuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';
import {
  Answer,
  AnswerInput,
  DependenciesLogicOperator,
  FieldDependency,
  QuestionaryStep,
  QuestionTemplateRelation,
  TemplateStep,
} from 'generated/sdk';
import { ConditionEvaluator } from 'models/ConditionEvaluator';

type AbstractField = QuestionTemplateRelation | Answer;
type AbstractCollection = TemplateStep[] | QuestionaryStep[];

export function getTopicById(collection: AbstractCollection, topicId: number) {
  // @ts-ignore-line
  const step = collection.find(step => step.topic.id === topicId);

  return step ? step : undefined;
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
  if (!field || !field.dependencies) {
    return true;
  }

  if (field.dependenciesOperator === DependenciesLogicOperator.OR) {
    return field.dependencies.some(dependency =>
      isDependencySatisfied(questionary, dependency)
    );
  } else {
    return field.dependencies.every(dependency =>
      isDependencySatisfied(questionary, dependency)
    );
  }
}

export function prepareAnswers(answers?: Answer[]): AnswerInput[] {
  if (answers) {
    answers = answers.filter(answer => {
      const definition = getQuestionaryComponentDefinition(
        answer.question.dataType
      );

      return !definition.readonly;
    });
    const preparedAnswers = answers.map(answer => {
      return {
        questionId: answer.question.proposalQuestionId,
        value: JSON.stringify({ value: answer.value }),
      }; // store value in JSON to preserve datatype e.g. { "value":74 } or { "value":"yes" } . Because of GraphQL limitations
    });

    return preparedAnswers;
  } else {
    return [];
  }
}

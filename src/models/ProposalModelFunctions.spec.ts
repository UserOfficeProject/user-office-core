import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { dummyQuestionTemplateRelationFactory } from '../datasources/mockups/QuestionaryDataSource';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { BooleanConfig } from '../resolvers/types/FieldConfig';
import {
  areDependenciesSatisfied,
  getFieldById,
  isMatchingConstraints,
} from './ProposalModelFunctions';
import { Answer } from './Questionary';
import { createConfig } from './questionTypes/QuestionRegistry';
import { DataType } from './Template';

let dataSource: QuestionaryDataSource;

beforeEach(() => {
  dataSource = container.resolve(Tokens.QuestionaryDataSource);
});

it('Field config "required=true" should make field required', async () => {
  const question = dummyQuestionTemplateRelationFactory({
    question: {
      dataType: DataType.BOOLEAN,
    },
    config: createConfig<BooleanConfig>(DataType.BOOLEAN, { required: true }),
  });
  await expect(isMatchingConstraints(question, false)).resolves.toBe(false);
  await expect(isMatchingConstraints(question, true)).resolves.toBe(true);
});

it('Field config "required=false" should make field not required', async () => {
  const question = dummyQuestionTemplateRelationFactory({
    question: {
      dataType: DataType.TEXT_INPUT,
    },
    config: createConfig<BooleanConfig>(DataType.TEXT_INPUT, {
      required: false,
    }),
  });
  await expect(isMatchingConstraints(question, 'text')).resolves.toBe(true);
  await expect(isMatchingConstraints(question, '')).resolves.toBe(true);
});

it('Dependencies should be satisfied if value matches', async () => {
  const questionarySteps = await dataSource.getQuestionarySteps(1);
  const dependee = getFieldById(
    questionarySteps,
    'has_links_with_industry'
  ) as Answer;
  const depender = getFieldById(
    questionarySteps,
    'links_with_industry'
  ) as Answer;

  expect(areDependenciesSatisfied(questionarySteps, depender.question.id)).toBe(
    true
  );

  dependee.value = 'no';

  expect(areDependenciesSatisfied(questionarySteps, depender.question.id)).toBe(
    false
  );
});

it('Multiple choice dependencies should be satisfied if value matches', async () => {
  const questionarySteps = await dataSource.getQuestionarySteps(1);
  const dependee = getFieldById(
    questionarySteps,
    'has_links_with_industry'
  ) as Answer;
  const depender = getFieldById(
    questionarySteps,
    'links_with_industry'
  ) as Answer;

  dependee.value = ['yes'];

  expect(areDependenciesSatisfied(questionarySteps, depender.question.id)).toBe(
    true
  );

  dependee.value = ['no'];

  expect(areDependenciesSatisfied(questionarySteps, depender.question.id)).toBe(
    false
  );
});

it('Multiple choice dependencies with multiple selected', async () => {
  const questionarySteps = await dataSource.getQuestionarySteps(1);
  const dependee = getFieldById(questionarySteps, 'multiple_choice') as Answer;
  const depender = getFieldById(
    questionarySteps,
    'multiple_choice_depender'
  ) as Answer;

  dependee.value = ['B'];

  expect(areDependenciesSatisfied(questionarySteps, depender.question.id)).toBe(
    true
  );

  dependee.value = ['C'];

  expect(areDependenciesSatisfied(questionarySteps, depender.question.id)).toBe(
    false
  );
});

it('OR dependency allows some satisfied', async () => {
  const questionarySteps = await dataSource.getQuestionarySteps(1);
  const dependee1 = getFieldById(questionarySteps, 'or_dependee_1') as Answer;
  const dependee2 = getFieldById(questionarySteps, 'or_dependee_2') as Answer;
  const depender = getFieldById(questionarySteps, 'or_depender') as Answer;

  dependee1.value = ['B'];
  dependee2.value = ['B'];

  expect(areDependenciesSatisfied(questionarySteps, depender.question.id)).toBe(
    true
  );

  dependee1.value = ['B'];
  dependee2.value = ['A'];

  expect(areDependenciesSatisfied(questionarySteps, depender.question.id)).toBe(
    true
  );

  dependee1.value = ['A'];
  dependee2.value = ['A'];

  expect(areDependenciesSatisfied(questionarySteps, depender.question.id)).toBe(
    false
  );
});

it('AND dependency requires all satisfied', async () => {
  const questionarySteps = await dataSource.getQuestionarySteps(1);
  const dependee1 = getFieldById(questionarySteps, 'and_dependee_1') as Answer;
  const dependee2 = getFieldById(questionarySteps, 'and_dependee_2') as Answer;
  const depender = getFieldById(questionarySteps, 'and_depender') as Answer;

  dependee1.value = 'B';
  dependee2.value = 'B';

  expect(areDependenciesSatisfied(questionarySteps, depender.question.id)).toBe(
    true
  );

  dependee1.value = 'B';
  dependee2.value = 'A';

  expect(areDependenciesSatisfied(questionarySteps, depender.question.id)).toBe(
    false
  );

  dependee1.value = 'A';
  dependee2.value = 'A';

  expect(areDependenciesSatisfied(questionarySteps, depender.question.id)).toBe(
    false
  );
});

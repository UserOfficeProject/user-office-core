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
  expect(isMatchingConstraints(question, false)).toBe(false);
  expect(isMatchingConstraints(question, true)).toBe(true);
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
  expect(isMatchingConstraints(question, 'text')).toBe(true);
  expect(isMatchingConstraints(question, '')).toBe(true);
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

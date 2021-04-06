import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { QuestionaryDataSourceMock } from '../datasources/mockups/QuestionaryDataSource';
import { dummyUserWithRole } from '../datasources/mockups/UserDataSource';
import QuestionaryQueries from './QuestionaryQueries';

const questionaryQueries = container.resolve(QuestionaryQueries);

beforeEach(() => {
  container
    .resolve<QuestionaryDataSourceMock>(Tokens.QuestionaryDataSource)
    .init();
});

test('Get questionary should succeed for authorized user', () => {
  return expect(
    questionaryQueries.getQuestionary(dummyUserWithRole, 1)
  ).resolves.not.toBe(null);
});

test('Get blank questionary steps should succeed for authorized user', () => {
  return expect(
    questionaryQueries.getBlankQuestionarySteps(dummyUserWithRole, 1)
  ).resolves.not.toBe(null);
});

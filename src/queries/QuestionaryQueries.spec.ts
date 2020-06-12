import 'reflect-metadata';
import { ProposalDataSourceMock } from '../datasources/mockups/ProposalDataSource';
import { QuestionaryDataSourceMock } from '../datasources/mockups/QuestionaryDataSource';
import { TemplateDataSourceMock } from '../datasources/mockups/TemplateDataSource';
import { dummyUserWithRole } from '../datasources/mockups/UserDataSource';
import QuestionaryQueries from './QuestionaryQueries';

const dummyProposalDataSource = new ProposalDataSourceMock();
const templateDataSource = new TemplateDataSourceMock();
const dummyQuestionaryDataSource = new QuestionaryDataSourceMock();

const questionaryQueries = new QuestionaryQueries(
  dummyQuestionaryDataSource,
  templateDataSource
);
beforeEach(() => {
  dummyProposalDataSource.init();
  templateDataSource.init();
  dummyQuestionaryDataSource.init();
});

test('Get questionary should succeed for authorized user', () => {
  return expect(
    questionaryQueries.getQuestionary(dummyUserWithRole, 1)
  ).resolves.not.toBe(null);
});

test('Get blank questionary should succeed for authorized user', () => {
  return expect(
    questionaryQueries.getBlankQuestionary(dummyUserWithRole, 1)
  ).resolves.not.toBe(null);
});

test('Get blank questionary steps should succeed for authorized user', () => {
  return expect(
    questionaryQueries.getBlankQuestionarySteps(dummyUserWithRole, 1)
  ).resolves.not.toBe(null);
});

import 'reflect-metadata';
import { ProposalDataSourceMock } from '../datasources/mockups/ProposalDataSource';
import { QuestionaryDataSourceMock } from '../datasources/mockups/QuestionaryDataSource';
import { TemplateDataSourceMock } from '../datasources/mockups/TemplateDataSource';
import { dummyUserWithRole } from '../datasources/mockups/UserDataSource';
import { QuestionaryAuthorization } from '../utils/QuestionaryAuthorization';
import QuestionaryQueries from './QuestionaryQueries';

const dummyProposalDataSource = new ProposalDataSourceMock();
const dummyTemplateDataSource = new TemplateDataSourceMock();
const dummyQuestionaryDataSource = new QuestionaryDataSourceMock();
const questionaryAuth = new QuestionaryAuthorization(
  dummyProposalDataSource,
  dummyQuestionaryDataSource,
  dummyTemplateDataSource
);
const questionaryQueries = new QuestionaryQueries(
  dummyQuestionaryDataSource,
  dummyTemplateDataSource,
  questionaryAuth
);
beforeEach(() => {
  dummyProposalDataSource.init();
  dummyTemplateDataSource.init();
  dummyQuestionaryDataSource.init();
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

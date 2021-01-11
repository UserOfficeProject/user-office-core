import 'reflect-metadata';
import { ProposalDataSourceMock } from '../datasources/mockups/ProposalDataSource';
import { QuestionaryDataSourceMock } from '../datasources/mockups/QuestionaryDataSource';
import { SampleDataSourceMock } from '../datasources/mockups/SampleDataSource';
import { ShipmentDataSourceMock } from '../datasources/mockups/ShipmentDataSource';
import { TemplateDataSourceMock } from '../datasources/mockups/TemplateDataSource';
import { dummyUserWithRole } from '../datasources/mockups/UserDataSource';
import { QuestionaryAuthorization } from '../utils/QuestionaryAuthorization';
import QuestionaryQueries from './QuestionaryQueries';

const dummyProposalDataSource = new ProposalDataSourceMock();
const dummyTemplateDataSource = new TemplateDataSourceMock();
const dummyQuestionaryDataSource = new QuestionaryDataSourceMock();
const dummySampleDataSource = new SampleDataSourceMock();
const dummyShipmentDataSource = new ShipmentDataSourceMock();

const questionaryAuth = new QuestionaryAuthorization(
  dummyProposalDataSource,
  dummyQuestionaryDataSource,
  dummyTemplateDataSource,
  dummySampleDataSource,
  dummyShipmentDataSource
);
const questionaryQueries = new QuestionaryQueries(
  dummyQuestionaryDataSource,
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

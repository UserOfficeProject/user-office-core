import 'reflect-metadata';
import { ProposalDataSourceMock } from '../datasources/mockups/ProposalDataSource';
import { QuestionaryDataSourceMock } from '../datasources/mockups/QuestionaryDataSource';
import { ReviewDataSourceMock } from '../datasources/mockups/ReviewDataSource';
import { TemplateDataSourceMock } from '../datasources/mockups/TemplateDataSource';
import {
  dummyUser,
  UserDataSourceMock,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import { UserAuthorization } from '../utils/UserAuthorization';
import QuestionaryQueries from './QuestionaryQueries';

const dummyProposalDataSource = new ProposalDataSourceMock();
const templateDataSource = new TemplateDataSourceMock();
const dummyQuestionaryDataSource = new QuestionaryDataSourceMock();
const userAuthorization = new UserAuthorization(
  new UserDataSourceMock(),
  new ReviewDataSourceMock()
);
const questionaryQueries = new QuestionaryQueries(
  dummyQuestionaryDataSource,
  templateDataSource,
  userAuthorization
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

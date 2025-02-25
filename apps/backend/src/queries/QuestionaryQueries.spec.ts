import 'reflect-metadata';
import { container } from 'tsyringe';

import { ProposalAuthorization } from '../auth/ProposalAuthorization';
import { Tokens } from '../config/Tokens';
import { QuestionaryDataSourceMock } from '../datasources/mockups/QuestionaryDataSource';
import {
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import QuestionaryQueries from './QuestionaryQueries';

const questionaryQueries = container.resolve(QuestionaryQueries);

beforeEach(() => {
  jest.clearAllMocks();

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

test('Get proposal attachments should succeed for authorised user', () => {
  return expect(
    questionaryQueries.getProposalAttachments(dummyUserOfficerWithRole, 1)
  ).resolves.toEqual(
    expect.objectContaining({
      questions: expect.arrayContaining([
        expect.objectContaining({
          id: 'file_upload_id',
        }),
      ]),
    })
  );
});

test('Get proposal attachments should fail for unauthorised user', () => {
  jest
    .spyOn(ProposalAuthorization.prototype, 'hasReadRights')
    .mockResolvedValue(false);

  return expect(
    questionaryQueries.getProposalAttachments(dummyUserWithRole, 1)
  ).resolves.toBe(null);
});

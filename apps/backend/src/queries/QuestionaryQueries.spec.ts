import 'reflect-metadata';
import { container } from 'tsyringe';

import QuestionaryQueries from './QuestionaryQueries';
import { ProposalAuthorization } from '../auth/ProposalAuthorization';
import { Tokens } from '../config/Tokens';
import { QuestionaryDataSourceMock } from '../datasources/mockups/QuestionaryDataSource';
import {
  dummyUserOfficerWithRole,
  dummyUserOfficerWithDerivedRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';

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

test('Question read permissions should match specific role IDs', async () => {
  const steps = await questionaryQueries.getBlankQuestionarySteps(
    dummyUserOfficerWithDerivedRole,
    1
  );
  const field = steps[0].fields[0];
  const restrictedSteps = [
    {
      ...steps[0],
      fields: [
        { ...field, config: { ...field.config, readPermissions: ['11'] } },
        { ...field, config: { ...field.config, readPermissions: ['2'] } },
      ],
    },
  ];

  const derivedRoleSteps = questionaryQueries.filterQuestionaryForReadPermissions(
    dummyUserOfficerWithDerivedRole,
    restrictedSteps
  );
  const rootRoleSteps = questionaryQueries.filterQuestionaryForReadPermissions(
    dummyUserOfficerWithRole,
    restrictedSteps
  );

  expect(derivedRoleSteps[0].fields).toHaveLength(1);
  expect(derivedRoleSteps[0].fields[0].config.readPermissions).toEqual(['11']);
  expect(rootRoleSteps[0].fields).toHaveLength(1);
  expect(rootRoleSteps[0].fields[0].config.readPermissions).toEqual(['2']);
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

/* eslint-disable prettier/prettier */
import 'reflect-metadata';
import { ProposalDataSourceMock } from '../datasources/mockups/ProposalDataSource';
import { ReviewDataSourceMock } from '../datasources/mockups/ReviewDataSource';
import { TemplateDataSourceMock } from '../datasources/mockups/TemplateDataSource';
import {
  dummyUserNotOnProposal,
  UserDataSourceMock,
  dummyUserWithRole,
  dummyUserOfficerWithRole,
  dummyUserNotOnProposalWithRole,
} from '../datasources/mockups/UserDataSource';
import { Proposal } from '../models/Proposal';
import { ProposalStatus } from '../models/ProposalModel';
import { MutedLogger } from '../utils/Logger';
import { UserAuthorization } from '../utils/UserAuthorization';
import { CallDataSourceMock } from './../datasources/mockups/CallDataSource';
import ProposalMutations from './ProposalMutations';

const dummyLogger = new MutedLogger();
const dummyProposalDataSource = new ProposalDataSourceMock();
const dummyTemplateDataSource = new TemplateDataSourceMock();
const dummyCallDataSource = new CallDataSourceMock();
const userAuthorization = new UserAuthorization(
  new UserDataSourceMock(),
  new ReviewDataSourceMock()
);
const proposalMutations = new ProposalMutations(
  dummyProposalDataSource,
  dummyTemplateDataSource,
  dummyCallDataSource,
  userAuthorization,
  dummyLogger
);

beforeEach(() => {
  dummyProposalDataSource.init();
});

test('A user on the proposal can update its title if it is in edit mode', () => {
  const newTitle = 'New Title';

  return expect(
    proposalMutations.update(dummyUserWithRole, { id: 1, title: newTitle })
  ).resolves.toHaveProperty('title', newTitle);
});

test('A user on the proposal can not update its title if it is not in edit mode', async () => {
  await proposalMutations.submit(dummyUserWithRole, 1);

  return expect(
    proposalMutations.update(dummyUserWithRole, { id: 1, title: '' })
  ).resolves.toHaveProperty('reason', 'NOT_ALLOWED_PROPOSAL_SUBMITTED');
});

test('A user-officer can update a proposal', async () => {
  const newTitle = 'New Title';

  return expect(
    proposalMutations.update(dummyUserOfficerWithRole, {
      id: 1,
      title: newTitle,
    })
  ).resolves.toHaveProperty('title', newTitle);
});

test('A user-officer can update submitted proposal', async () => {
  const newTitle = 'New Title';
  await proposalMutations.submit(dummyUserOfficerWithRole, 1);

  return expect(
    proposalMutations.update(dummyUserOfficerWithRole, {
      id: 1,
      title: newTitle,
    })
  ).resolves.toHaveProperty('title', newTitle);
});

test('A user-officer can update a proposals score in submit mode', async () => {
  const newProposerId = 99;
  await proposalMutations.submit(dummyUserOfficerWithRole, 1);

  return expect(
    proposalMutations.update(dummyUserOfficerWithRole, {
      id: 1,
      proposerId: newProposerId,
    })
  ).resolves.toHaveProperty('proposerId', newProposerId);
});

test('A user can not update a proposals score mode', async () => {
  const newProposerId = 99;
  await proposalMutations.submit(dummyUserWithRole, 1);

  return expect(
    proposalMutations.update(dummyUserWithRole, {
      id: 1,
      proposerId: newProposerId,
    })
  ).resolves.toHaveProperty('reason', 'NOT_ALLOWED_PROPOSAL_SUBMITTED');
});

test('A user not on a proposal can not update it', () => {
  return expect(
    proposalMutations.update(dummyUserNotOnProposalWithRole, {
      id: 1,
      proposerId: dummyUserNotOnProposal.id,
    })
  ).resolves.toHaveProperty('reason', 'NOT_ALLOWED');
});

//Submit

test('A user officer can not reject a proposal that does not exist', () => {
  return expect(
    proposalMutations.submit(dummyUserOfficerWithRole, 99)
  ).resolves.toHaveProperty('reason', 'INTERNAL_ERROR');
});

test('A user officer can submit a proposal ', () => {
  return expect(
    proposalMutations.submit(dummyUserOfficerWithRole, 1)
  ).resolves.toHaveProperty('status', ProposalStatus.SUBMITTED);
});

test('A user officer can not submit a proposal that does not exist', () => {
  return expect(
    proposalMutations.submit(dummyUserOfficerWithRole, -1)
  ).resolves.toHaveProperty('reason', 'INTERNAL_ERROR');
});

test('A user on the proposal can submit a proposal ', () => {
  return expect(
    proposalMutations.submit(dummyUserWithRole, 1)
  ).resolves.toHaveProperty('status', ProposalStatus.SUBMITTED);
});

test('A user not on the proposal cannot submit a proposal ', () => {
  return expect(
    proposalMutations.submit(dummyUserNotOnProposalWithRole, 1)
  ).resolves.toHaveProperty('reason', 'NOT_ALLOWED');
});

test('A non-logged in user cannot submit a proposal', () => {
  return expect(proposalMutations.submit(null, 1)).resolves.toHaveProperty(
    'reason',
    'NOT_LOGGED_IN'
  );
});

test('A user can attach files', () => {
  const dummyFileList = ['1020597501870552'];

  return expect(
    proposalMutations.updateFiles(dummyUserWithRole, {
      proposalId: 1,
      questionId: 'reference_files',
      files: dummyFileList,
    })
  ).resolves.toBe(dummyFileList);
});

test('A non-belonging should not be able to attach files', () => {
  const dummyFileList = ['1020597501870552'];

  return expect(
    proposalMutations.updateFiles(dummyUserNotOnProposalWithRole, {
      proposalId: 1,
      questionId: 'reference_files',
      files: dummyFileList,
    })
  ).resolves.not.toBe(dummyFileList);
});

test('User must have valid session to attach files', () => {
  return expect(
    proposalMutations.updateFiles(null, {
      proposalId: 1,
      questionId: 'reference_files',
      files: ['1020597501870552'],
    })
  ).resolves.toHaveProperty('reason', 'NOT_LOGGED_IN');
});

test('User officer can delete a proposal', () => {
  return expect(
    proposalMutations.delete(dummyUserOfficerWithRole, 1)
  ).resolves.toBeInstanceOf(Proposal);
});

test('User cannot delete a proposal', () => {
  return expect(
    proposalMutations.delete(dummyUserNotOnProposalWithRole, 1)
  ).resolves.not.toBeInstanceOf(Proposal);
});

test('Has to be logged in to create proposal', () => {
  return expect(proposalMutations.create(null, 1)).resolves.not.toBeInstanceOf(
    Proposal
  );
});

test('Can create a proposal', () => {
  return expect(
    proposalMutations.create(dummyUserWithRole, 1)
  ).resolves.toBeInstanceOf(Proposal);
});

test('User officer can set final status of a proposal', () => {
  return expect(
    proposalMutations.admin(dummyUserOfficerWithRole, { id: 1, finalStatus: 1 })
  ).resolves.toBeInstanceOf(Proposal);
});

test('User cannot set final status of a proposal', () => {
  return expect(
    proposalMutations.admin(dummyUserNotOnProposalWithRole, {
      id: 1,
      finalStatus: 1,
    })
  ).resolves.not.toBeInstanceOf(Proposal);
});

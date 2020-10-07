/* eslint-disable prettier/prettier */
import 'reflect-metadata';
import { ProposalDataSourceMock } from '../datasources/mockups/ProposalDataSource';
import { QuestionaryDataSourceMock } from '../datasources/mockups/QuestionaryDataSource';
import { ReviewDataSourceMock } from '../datasources/mockups/ReviewDataSource';
import { SEPDataSourceMock } from '../datasources/mockups/SEPDataSource';
import {
  dummyUserNotOnProposal,
  UserDataSourceMock,
  dummyUserWithRole,
  dummyUserOfficerWithRole,
  dummyUserNotOnProposalWithRole,
} from '../datasources/mockups/UserDataSource';
import { Proposal } from '../models/Proposal';
import { MutedLogger } from '../utils/Logger';
import { UserAuthorization } from '../utils/UserAuthorization';
import { CallDataSourceMock } from './../datasources/mockups/CallDataSource';
import ProposalMutations from './ProposalMutations';

const dummyLogger = new MutedLogger();
const dummyProposalDataSource = new ProposalDataSourceMock();
const dummyQuestionaryDataSource = new QuestionaryDataSourceMock();
const dummyCallDataSource = new CallDataSourceMock();
const userAuthorization = new UserAuthorization(
  new UserDataSourceMock(),
  new ReviewDataSourceMock(),
  new SEPDataSourceMock()
);
const proposalMutations = new ProposalMutations(
  dummyProposalDataSource,
  dummyQuestionaryDataSource,
  dummyCallDataSource,
  userAuthorization,
  dummyLogger
);

beforeEach(() => {
  dummyQuestionaryDataSource.init();
  dummyProposalDataSource.init();
});

test('A user on the proposal can update its title if it is in edit mode', () => {
  const newTitle = 'New Title';

  return expect(
    proposalMutations.update(dummyUserWithRole, { id: 1, title: newTitle })
  ).resolves.toHaveProperty('title', newTitle);
});

test('A user on the proposal can not update its title if it is not in edit mode', async () => {
  await proposalMutations.submit(dummyUserWithRole, { proposalId: 1 });

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
  await proposalMutations.submit(dummyUserOfficerWithRole, { proposalId: 1 });

  return expect(
    proposalMutations.update(dummyUserOfficerWithRole, {
      id: 1,
      title: newTitle,
    })
  ).resolves.toHaveProperty('title', newTitle);
});

test('A user-officer can update a proposals score in submit mode', async () => {
  const newProposerId = 99;
  await proposalMutations.submit(dummyUserOfficerWithRole, { proposalId: 1 });

  return expect(
    proposalMutations.update(dummyUserOfficerWithRole, {
      id: 1,
      proposerId: newProposerId,
    })
  ).resolves.toHaveProperty('proposerId', newProposerId);
});

test('A user can not update a proposals score mode', async () => {
  const newProposerId = 99;
  await proposalMutations.submit(dummyUserWithRole, { proposalId: 1 });

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
    proposalMutations.submit(dummyUserOfficerWithRole, { proposalId: 99 })
  ).resolves.toHaveProperty('reason', 'INTERNAL_ERROR');
});

test('A user officer can submit a proposal', () => {
  return expect(
    proposalMutations.submit(dummyUserOfficerWithRole, { proposalId: 1 })
  ).resolves.toHaveProperty('submitted', true);
});

test('A user officer can not submit a proposal that does not exist', () => {
  return expect(
    proposalMutations.submit(dummyUserOfficerWithRole, { proposalId: -1 })
  ).resolves.toHaveProperty('reason', 'INTERNAL_ERROR');
});

test('A user on the proposal can submit a proposal', () => {
  return expect(
    proposalMutations.submit(dummyUserWithRole, { proposalId: 1 })
  ).resolves.toHaveProperty('submitted', true);
});

test('A user not on the proposal cannot submit a proposal', () => {
  return expect(
    proposalMutations.submit(dummyUserNotOnProposalWithRole, { proposalId: 1 })
  ).resolves.toHaveProperty('reason', 'NOT_ALLOWED');
});

test('A non-logged in user cannot submit a proposal', () => {
  return expect(
    proposalMutations.submit(null, { proposalId: 1 })
  ).resolves.toHaveProperty('reason', 'NOT_LOGGED_IN');
});

test('User officer can delete a proposal', () => {
  return expect(
    proposalMutations.delete(dummyUserOfficerWithRole, { proposalId: 1 })
  ).resolves.toBeInstanceOf(Proposal);
});

test('User cannot delete a proposal', () => {
  return expect(
    proposalMutations.delete(dummyUserNotOnProposalWithRole, { proposalId: 1 })
  ).resolves.not.toBeInstanceOf(Proposal);
});

test('Has to be logged in to create proposal', () => {
  return expect(
    proposalMutations.create(null, { callId: 1 })
  ).resolves.not.toBeInstanceOf(Proposal);
});

test('Can create a proposal', () => {
  return expect(
    proposalMutations.create(dummyUserWithRole, { callId: 1 })
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

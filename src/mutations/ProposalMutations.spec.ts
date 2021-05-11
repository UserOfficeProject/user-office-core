/* eslint-disable prettier/prettier */
import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import {
  ProposalDataSourceMock,
  dummyProposalWithNotActiveCall,
  dummyProposalSubmitted,
} from '../datasources/mockups/ProposalDataSource';
import {
  dummyPrincipalInvestigatorWithRole,
  dummyUserNotOnProposal,
  dummyUserNotOnProposalWithRole,
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import { Proposal } from '../models/Proposal';
import { isRejection } from '../rejection';
import ProposalMutations from './ProposalMutations';

const proposalMutations = container.resolve(ProposalMutations);

beforeEach(() => {
  container.resolve<ProposalDataSourceMock>(Tokens.ProposalDataSource).init();
});

test('A user on the proposal can update its title if it is in edit mode', () => {
  const newTitle = 'New Title';

  return expect(
    proposalMutations.update(dummyUserWithRole, { id: 1, title: newTitle })
  ).resolves.toHaveProperty('title', newTitle);
});

test('A user on the proposal can not update its title if it is not in edit mode', async () => {
  return expect(
    proposalMutations.update(dummyUserWithRole, {
      id: dummyProposalSubmitted.id,
      title: '',
    })
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

test('A user-officer can update a proposal even if the call is not active', async () => {
  const newTitle = 'New Title';

  return expect(
    proposalMutations.update(dummyUserOfficerWithRole, {
      id: dummyProposalWithNotActiveCall.id,
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

test('A user-officer can submit proposal even if the call is not active', async () => {
  const result = await proposalMutations.submit(dummyUserOfficerWithRole, {
    proposalId: dummyProposalWithNotActiveCall.id,
  });

  return expect(isRejection(result)).toBe(false);
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

  return expect(
    proposalMutations.update(dummyUserWithRole, {
      id: dummyProposalSubmitted.id,
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

test('A user on the proposal can not submit a proposal if the call is not active', async () => {
  const result = await proposalMutations.submit(dummyUserWithRole, {
    proposalId: 3,
  });

  return expect(isRejection(result)).toBe(true);
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

test('Principal investigator can delete a proposal', () => {
  return expect(
    proposalMutations.delete(dummyPrincipalInvestigatorWithRole, {
      proposalId: 1,
    })
  ).resolves.toBeInstanceOf(Proposal);
});

test('Principal investigator can not delete submitted proposal', async () => {
  return expect(
    proposalMutations.delete(dummyPrincipalInvestigatorWithRole, {
      proposalId: dummyProposalSubmitted.id,
    })
  ).resolves.toHaveProperty('reason', 'NOT_ALLOWED');
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

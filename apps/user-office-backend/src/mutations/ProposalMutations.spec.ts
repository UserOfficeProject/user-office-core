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
import { isRejection, Rejection } from '../models/Rejection';
import ProposalMutations from './ProposalMutations';

const proposalMutations = container.resolve(ProposalMutations);

let dataSource: ProposalDataSourceMock;

beforeEach(() => {
  dataSource = container.resolve<ProposalDataSourceMock>(
    Tokens.ProposalDataSource
  );
  dataSource.init();
});

test('A user on the proposal can update its title if it is in edit mode', () => {
  const newTitle = 'New Title';

  return expect(
    proposalMutations.update(dummyUserWithRole, {
      proposalPk: 1,
      title: newTitle,
    })
  ).resolves.toHaveProperty('title', newTitle);
});

test('A user on the proposal can not update its title if it is not in edit mode', async () => {
  return expect(
    proposalMutations.update(dummyUserWithRole, {
      proposalPk: dummyProposalSubmitted.primaryKey,
      title: '',
    })
  ).resolves.toBeInstanceOf(Rejection);
});

test('A user-officer can update a proposal', async () => {
  const newTitle = 'New Title';

  return expect(
    proposalMutations.update(dummyUserOfficerWithRole, {
      proposalPk: 1,
      title: newTitle,
    })
  ).resolves.toHaveProperty('title', newTitle);
});

test('A user-officer can update a proposal even if the call is not active', async () => {
  const newTitle = 'New Title';

  return expect(
    proposalMutations.update(dummyUserOfficerWithRole, {
      proposalPk: dummyProposalWithNotActiveCall.primaryKey,
      title: newTitle,
    })
  ).resolves.toHaveProperty('title', newTitle);
});

test('A user-officer can update submitted proposal', async () => {
  const newTitle = 'New Title';
  await proposalMutations.submit(dummyUserOfficerWithRole, { proposalPk: 1 });

  return expect(
    proposalMutations.update(dummyUserOfficerWithRole, {
      proposalPk: 1,
      title: newTitle,
    })
  ).resolves.toHaveProperty('title', newTitle);
});

test('A user-officer can submit proposal even if the call is not active', async () => {
  const result = await proposalMutations.submit(dummyUserOfficerWithRole, {
    proposalPk: dummyProposalWithNotActiveCall.primaryKey,
  });

  return expect(isRejection(result)).toBe(false);
});

test('A user-officer can update a proposals score in submit mode', async () => {
  const newProposerId = 99;
  await proposalMutations.submit(dummyUserOfficerWithRole, { proposalPk: 1 });

  return expect(
    proposalMutations.update(dummyUserOfficerWithRole, {
      proposalPk: 1,
      proposerId: newProposerId,
    })
  ).resolves.toHaveProperty('proposerId', newProposerId);
});

test('A user can not update a proposals score mode', async () => {
  const newProposerId = 99;

  return expect(
    proposalMutations.update(dummyUserWithRole, {
      proposalPk: dummyProposalSubmitted.primaryKey,
      proposerId: newProposerId,
    })
  ).resolves.toBeInstanceOf(Rejection);
});

test('A user not on a proposal can not update it', () => {
  return expect(
    proposalMutations.update(dummyUserNotOnProposalWithRole, {
      proposalPk: 1,
      proposerId: dummyUserNotOnProposal.id,
    })
  ).resolves.toBeInstanceOf(Rejection);
});

//Submit

test('A user officer can not reject a proposal that does not exist', () => {
  return expect(
    proposalMutations.submit(dummyUserOfficerWithRole, { proposalPk: 99 })
  ).resolves.toHaveProperty(
    'reason',
    'Can not submit proposal, because proposal not found'
  );
});

test('A user officer can submit a proposal', () => {
  return expect(
    proposalMutations.submit(dummyUserOfficerWithRole, { proposalPk: 1 })
  ).resolves.toHaveProperty('submitted', true);
});

test('A user officer can not submit a proposal that does not exist', () => {
  return expect(
    proposalMutations.submit(dummyUserOfficerWithRole, { proposalPk: -1 })
  ).resolves.toHaveProperty(
    'reason',
    'Can not submit proposal, because proposal not found'
  );
});

test('A user on the proposal can submit a proposal', () => {
  return expect(
    proposalMutations.submit(dummyUserWithRole, { proposalPk: 1 })
  ).resolves.toHaveProperty('submitted', true);
});

test('A user on the proposal can not submit a proposal if the call is not active', async () => {
  const result = await proposalMutations.submit(dummyUserWithRole, {
    proposalPk: 3,
  });

  return expect(isRejection(result)).toBe(true);
});

test('A user not on the proposal cannot submit a proposal', () => {
  return expect(
    proposalMutations.submit(dummyUserNotOnProposalWithRole, { proposalPk: 1 })
  ).resolves.toHaveProperty(
    'reason',
    'Unauthorized submission of the proposal'
  );
});

test('A non-logged in user cannot submit a proposal', () => {
  return expect(
    proposalMutations.submit(null, { proposalPk: 1 })
  ).resolves.toHaveProperty('reason', 'NOT_LOGGED_IN');
});

test('User officer can delete a proposal', () => {
  return expect(
    proposalMutations.delete(dummyUserOfficerWithRole, { proposalPk: 1 })
  ).resolves.toBeInstanceOf(Proposal);
});

test('User cannot delete a proposal', () => {
  return expect(
    proposalMutations.delete(dummyUserNotOnProposalWithRole, { proposalPk: 1 })
  ).resolves.not.toBeInstanceOf(Proposal);
});

test('Principal investigator can delete a proposal', () => {
  return expect(
    proposalMutations.delete(dummyPrincipalInvestigatorWithRole, {
      proposalPk: 1,
    })
  ).resolves.toBeInstanceOf(Proposal);
});

test('Principal investigator can not delete submitted proposal', async () => {
  return expect(
    proposalMutations.delete(dummyPrincipalInvestigatorWithRole, {
      proposalPk: dummyProposalSubmitted.primaryKey,
    })
  ).resolves.toHaveProperty(
    'reason',
    'Can not delete proposal because proposal is submitted'
  );
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
    proposalMutations.admin(dummyUserOfficerWithRole, {
      proposalPk: 1,
      finalStatus: 1,
    })
  ).resolves.toBeInstanceOf(Proposal);
});

test('User cannot set final status of a proposal', () => {
  return expect(
    proposalMutations.admin(dummyUserNotOnProposalWithRole, {
      proposalPk: 1,
      finalStatus: 1,
    })
  ).resolves.not.toBeInstanceOf(Proposal);
});

test('User cannot import a proposal', () => {
  return expect(
    proposalMutations.import(dummyUserWithRole, {
      submitterId: 1,
      referenceNumber: '21219999',
      callId: 1,
    })
  ).resolves.not.toBeInstanceOf(Proposal);
});

test('User Officer can import a legacy proposal', () => {
  return expect(
    proposalMutations.import(dummyUserOfficerWithRole, {
      submitterId: 1,
      referenceNumber: '21219999',
      callId: 1,
    })
  ).resolves.toBeInstanceOf(Proposal);
});

test('Proposal import is creating a proposal', () => {
  return expect(
    proposalMutations.import(dummyUserOfficerWithRole, {
      submitterId: 1,
      referenceNumber: '21219999',
      callId: 1,
    })
  ).resolves.toHaveProperty('proposerId', 1);
});

test('Proposal import is updating the proposal', async () => {
  await proposalMutations.import(dummyUserOfficerWithRole, {
    submitterId: 1,
    referenceNumber: '21219999',
    callId: 1,
    title: 'new title',
  });

  return expect(
    dataSource.proposalsUpdated[0] //Hacky
  ).toHaveProperty('title', 'new title');
});

test('Proposal import is submitting the proposal', () => {
  return expect(
    proposalMutations.import(dummyUserOfficerWithRole, {
      submitterId: 1,
      referenceNumber: '21219999',
      callId: 1,
    })
  ).resolves.toHaveProperty('proposalId', '21219999');
});

test('Proposal cannot be submitted without a call', () => {
  return expect(
    proposalMutations.import(dummyUserOfficerWithRole, {
      submitterId: 1,
      referenceNumber: '21219999',
      callId: -1,
    })
  ).resolves.not.toBeInstanceOf(Proposal);
});

import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import {
  dummyProposal,
  ProposalDataSourceMock,
} from '../datasources/mockups/ProposalDataSource';
import {
  dummyUserNotOnProposalWithRole,
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import { Proposal } from '../models/Proposal';
import { omit } from '../utils/helperFunctions';
import ProposalQueries from './ProposalQueries';

const proposalQueries = container.resolve(ProposalQueries);

beforeEach(() => {
  container.resolve<ProposalDataSourceMock>(Tokens.ProposalDataSource).init();
});

test('A user on the proposal can get a proposal it belongs to', () => {
  return expect(
    proposalQueries.get(dummyUserWithRole, 1)
  ).resolves.toStrictEqual(
    dummyProposal.notified
      ? omit(dummyProposal, 'commentForManagement', 'commentByScientist')
      : omit(
          dummyProposal,
          'commentForManagement',
          'finalStatus',
          'commentForUser',
          'commentByScientist'
        )
  );
});

test('A user not on the proposal cannot get a proposal', () => {
  return expect(
    proposalQueries.get(
      dummyUserNotOnProposalWithRole,
      dummyProposal.primaryKey
    )
  ).resolves.toBe(null);
});

test('A userofficer can get any proposal', () => {
  return expect(proposalQueries.get(dummyUserOfficerWithRole, 1)).resolves.toBe(
    dummyProposal
  );
});

test('A userofficer can get all proposal', async () => {
  return expect(
    (await proposalQueries.getAll(dummyUserOfficerWithRole)).totalCount
  ).toBeGreaterThan(0);
});

test('A user cannot query all proposals', () => {
  return expect(proposalQueries.getAll(dummyUserWithRole)).resolves.toBe(null);
});

test('User on proposal should get the proposal', async () => {
  return expect(
    proposalQueries.getProposalById(dummyUserWithRole, 'shortCode')
  ).resolves.toBeInstanceOf(Proposal);
});

test('User not on proposal should not get the proposal', async () => {
  return expect(
    proposalQueries.getProposalById(dummyUserNotOnProposalWithRole, 'shortCode')
  ).resolves.not.toBeInstanceOf(Proposal);
});

test('User officer should get the proposal', async () => {
  return expect(
    proposalQueries.getProposalById(dummyUserOfficerWithRole, 'shortCode')
  ).resolves.toBeInstanceOf(Proposal);
});

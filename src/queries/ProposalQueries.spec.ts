import 'reflect-metadata';
import { CallDataSourceMock } from '../datasources/mockups/CallDataSource';
import {
  dummyProposal,
  ProposalDataSourceMock,
} from '../datasources/mockups/ProposalDataSource';
import { ReviewDataSourceMock } from '../datasources/mockups/ReviewDataSource';
import { SEPDataSourceMock } from '../datasources/mockups/SEPDataSource';
import {
  UserDataSourceMock,
  dummyUserWithRole,
  dummyUserNotOnProposalWithRole,
  dummyUserOfficerWithRole,
} from '../datasources/mockups/UserDataSource';
import { ProposalPublicStatus } from '../models/Proposal';
import { omit } from '../utils/helperFunctions';
import { UserAuthorization } from '../utils/UserAuthorization';
import ProposalQueries from './ProposalQueries';

const dummyProposalDataSource = new ProposalDataSourceMock();
const dummyCallDataSource = new CallDataSourceMock();
const userAuthorization = new UserAuthorization(
  new UserDataSourceMock(),
  new ReviewDataSourceMock(),
  new SEPDataSourceMock()
);
const proposalQueries = new ProposalQueries(
  dummyProposalDataSource,
  dummyCallDataSource,
  userAuthorization
);
beforeEach(() => {
  dummyProposalDataSource.init();
});

test('A user on the proposal can get a proposal it belongs to', () => {
  return expect(
    proposalQueries.get(dummyUserWithRole, 1)
  ).resolves.toStrictEqual(
    dummyProposal.notified
      ? omit(dummyProposal, 'rankOrder', 'commentForManagement')
      : omit(
          dummyProposal,
          'rankOrder',
          'commentForManagement',
          'finalStatus',
          'commentForUser'
        )
  );
});

test('A user not on the proposal cannot get a proposal', () => {
  return expect(
    proposalQueries.get(dummyUserNotOnProposalWithRole, dummyProposal.id)
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

test('User should see the right status for draft proposal', async () => {
  return expect(
    proposalQueries.getPublicStatus(dummyUserWithRole, 1)
  ).resolves.toBe(ProposalPublicStatus.draft);
});

test('User should see the right status for submitted proposal', async () => {
  return expect(
    proposalQueries.getPublicStatus(dummyUserWithRole, 2)
  ).resolves.toBe(ProposalPublicStatus.accepted);
});

import 'reflect-metadata';
import { CallDataSourceMock } from '../datasources/mockups/CallDataSource';
import {
  dummyProposal,
  ProposalDataSourceMock,
} from '../datasources/mockups/ProposalDataSource';
import { ReviewDataSourceMock } from '../datasources/mockups/ReviewDataSource';
import {
  dummyUser,
  dummyUserNotOnProposal,
  dummyUserOfficer,
  UserDataSourceMock,
} from '../datasources/mockups/UserDataSource';
import { UserAuthorization } from '../utils/UserAuthorization';
import ProposalQueries from './ProposalQueries';

const dummyProposalDataSource = new ProposalDataSourceMock();
const dummyCallDataSource = new CallDataSourceMock();
const userAuthorization = new UserAuthorization(
  new UserDataSourceMock(),
  new ReviewDataSourceMock()
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
  return expect(proposalQueries.get(dummyUser, 1)).resolves.toBe(dummyProposal);
});

test('A user not on the proposal cannot get a proposal', () => {
  return expect(
    proposalQueries.get(dummyUserNotOnProposal, dummyProposal.id)
  ).resolves.toBe(null);
});

test('A userofficer can get any proposal', () => {
  return expect(proposalQueries.get(dummyUserOfficer, 1)).resolves.toBe(
    dummyProposal
  );
});

test('A userofficer can get all proposal', () => {
  return expect(
    proposalQueries.getAll(dummyUserOfficer)
  ).resolves.toStrictEqual({
    totalCount: 1,
    proposals: [dummyProposal],
  });
});

test('A user cannot query all proposals', () => {
  return expect(proposalQueries.getAll(dummyUser)).resolves.toBe(null);
});

import 'reflect-metadata';

import {
  dummyProposalStatus,
  ProposalStatusDataSourceMock,
} from '../datasources/mockups/ProposalStatusDataSource';
import {
  dummyUserWithRole,
  dummyUserOfficerWithRole,
} from '../datasources/mockups/UserDataSource';
import ProposalStatusQueries from './ProposalStatusQueries';

const dummyProposalStatusDataSource = new ProposalStatusDataSourceMock();
const ProposalStatusQueriesInstance = new ProposalStatusQueries(
  dummyProposalStatusDataSource
);

describe('Test Proposal Statuses Queries', () => {
  test('A user cannot query all Proposal Statuses', () => {
    return expect(
      ProposalStatusQueriesInstance.getAll(dummyUserWithRole)
    ).resolves.toBe(null);
  });

  test('A userofficer can get all Proposal Statuses', () => {
    return expect(
      ProposalStatusQueriesInstance.getAll(dummyUserOfficerWithRole)
    ).resolves.toStrictEqual([dummyProposalStatus]);
  });

  test('A userofficer can get Proposal Status by id', () => {
    return expect(
      ProposalStatusQueriesInstance.get(dummyUserOfficerWithRole, 1)
    ).resolves.toStrictEqual(dummyProposalStatus);
  });
});

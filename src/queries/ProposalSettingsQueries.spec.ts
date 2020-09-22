import 'reflect-metadata';

import {
  dummyProposalStatus,
  ProposalSettingsDataSourceMock,
} from '../datasources/mockups/ProposalSettingsDataSource';
import {
  dummyUserWithRole,
  dummyUserOfficerWithRole,
} from '../datasources/mockups/UserDataSource';
import ProposalSettingsQueries from './ProposalSettingsQueries';

const dummyProposalSettingsDataSource = new ProposalSettingsDataSourceMock();
const ProposalSettingsQueriesInstance = new ProposalSettingsQueries(
  dummyProposalSettingsDataSource
);

describe('Test Proposal Statuses Queries', () => {
  test('A user cannot query all Proposal Statuses', () => {
    return expect(
      ProposalSettingsQueriesInstance.getAllProposalStatuses(dummyUserWithRole)
    ).resolves.toBe(null);
  });

  test('A userofficer can get all Proposal Statuses', () => {
    return expect(
      ProposalSettingsQueriesInstance.getAllProposalStatuses(
        dummyUserOfficerWithRole
      )
    ).resolves.toStrictEqual([dummyProposalStatus]);
  });

  test('A userofficer can get Proposal Status by id', () => {
    return expect(
      ProposalSettingsQueriesInstance.getProposalStatus(
        dummyUserOfficerWithRole,
        1
      )
    ).resolves.toStrictEqual(dummyProposalStatus);
  });
});

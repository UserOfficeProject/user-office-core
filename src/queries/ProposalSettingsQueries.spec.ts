import 'reflect-metadata';

import {
  anotherDummyProposalWorkflowConnection,
  dummyProposalStatus,
  dummyProposalWorkflow,
  dummyProposalWorkflowConnection,
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

describe('Test Proposal Workflows Queries', () => {
  test('A user cannot query all Proposal Workflows', () => {
    return expect(
      ProposalSettingsQueriesInstance.getAllProposalWorkflows(dummyUserWithRole)
    ).resolves.toBe(null);
  });

  test('A userofficer can get all Proposal Workflows', () => {
    return expect(
      ProposalSettingsQueriesInstance.getAllProposalWorkflows(
        dummyUserOfficerWithRole
      )
    ).resolves.toStrictEqual([dummyProposalWorkflow]);
  });

  test('A userofficer can get Proposal Workflow by id', () => {
    return expect(
      ProposalSettingsQueriesInstance.getProposalWorkflow(
        dummyUserOfficerWithRole,
        1
      )
    ).resolves.toStrictEqual(dummyProposalWorkflow);
  });

  test('A user can not get Proposal Workflow connections', () => {
    return expect(
      ProposalSettingsQueriesInstance.proposalWorkflowConnectionGroups(
        dummyUserWithRole,
        1
      )
    ).resolves.toBe(null);
  });

  test('A userofficer can get Proposal Workflow connections', () => {
    return expect(
      ProposalSettingsQueriesInstance.proposalWorkflowConnectionGroups(
        dummyUserOfficerWithRole,
        1
      )
    ).resolves.toStrictEqual([
      {
        groupId: 'proposalWorkflowConnections_0',
        parentGroupId: null,
        connections: [
          dummyProposalWorkflowConnection,
          anotherDummyProposalWorkflowConnection,
        ],
      },
    ]);
  });
});

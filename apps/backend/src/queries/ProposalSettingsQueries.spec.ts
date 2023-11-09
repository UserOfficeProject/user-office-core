import 'reflect-metadata';
import { container } from 'tsyringe';

import {
  anotherDummyProposalWorkflowConnection,
  dummyProposalStatuses,
  dummyProposalWorkflow,
  dummyProposalWorkflowConnection,
} from '../datasources/mockups/ProposalSettingsDataSource';
import {
  dummyStatusAction,
  dummyStatusActions,
} from '../datasources/mockups/StatusActionsDataSource';
import {
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import { ProposalStatus } from './../models/ProposalStatus';
import ProposalSettingsQueries from './ProposalSettingsQueries';

const ProposalSettingsQueriesInstance = container.resolve(
  ProposalSettingsQueries
);

describe('Test Proposal Statuses Queries', () => {
  test('A userofficer can get all Proposal Statuses', async () => {
    return expect(
      ProposalSettingsQueriesInstance.getAllProposalStatuses(
        dummyUserOfficerWithRole
      )
    ).resolves.toEqual(expect.arrayContaining(dummyProposalStatuses));
  });

  test('A userofficer can get Proposal Status by id', () => {
    return expect(
      ProposalSettingsQueriesInstance.getProposalStatus(
        dummyUserOfficerWithRole,
        1
      )
    ).resolves.toBeInstanceOf(ProposalStatus);
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

  test('A userofficer can get Proposal Workflow status actions', () => {
    return expect(
      ProposalSettingsQueriesInstance.getStatusActions(dummyUserOfficerWithRole)
    ).resolves.toStrictEqual(dummyStatusActions);
  });

  test('A userofficer can get single Proposal Workflow status action', () => {
    return expect(
      ProposalSettingsQueriesInstance.getStatusAction(
        dummyUserOfficerWithRole,
        1
      )
    ).resolves.toStrictEqual(dummyStatusAction);
  });
});

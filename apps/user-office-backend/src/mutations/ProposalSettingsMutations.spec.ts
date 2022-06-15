import 'reflect-metadata';
import { container } from 'tsyringe';

import {
  dummyProposalWorkflow,
  dummyProposalWorkflowConnection,
  dummyStatusChangingEvent,
} from '../datasources/mockups/ProposalSettingsDataSource';
import {
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import { Rejection } from '../models/Rejection';
import ProposalSettingsMutations from './ProposalSettingsMutations';

const ProposalSettingsMutationsInstance = container.resolve(
  ProposalSettingsMutations
);

describe('Test Proposal settings mutations', () => {
  test('A user can not create proposal status', async () => {
    const result =
      (await ProposalSettingsMutationsInstance.createProposalStatus(
        dummyUserWithRole,
        {
          shortCode: 'NEW',
          name: 'new',
          description: 'new',
        }
      )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can not create proposal status with bad input arguments', () => {
    return expect(
      ProposalSettingsMutationsInstance.createProposalStatus(
        dummyUserOfficerWithRole,
        {
          shortCode: 'Test',
          name: 'Test',
          description: 'This is some small description',
        }
      )
    ).resolves.toHaveProperty('reason', 'Input validation errors');
  });

  test('A userofficer can create proposal status', () => {
    const newStatus = {
      shortCode: 'NEW',
      name: 'NEW',
      description: 'NEW',
    };

    return expect(
      ProposalSettingsMutationsInstance.createProposalStatus(
        dummyUserOfficerWithRole,
        newStatus
      )
    ).resolves.toMatchObject(newStatus);
  });

  test('A user cannot update proposal status', async () => {
    const result =
      (await ProposalSettingsMutationsInstance.updateProposalStatus(
        dummyUserWithRole,
        {
          id: 1,
          shortCode: 'UPDATE',
          name: 'update',
          description: 'update',
          isDefault: false,
        }
      )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can update proposal status', () => {
    const updatedStatus = {
      id: 1,
      shortCode: 'UPDATE',
      name: 'update',
      description: 'update',
      isDefault: false,
    };

    return expect(
      ProposalSettingsMutationsInstance.updateProposalStatus(
        dummyUserOfficerWithRole,
        updatedStatus
      )
    ).resolves.toMatchObject(updatedStatus);
  });

  test('A userofficer can remove proposal status', () => {
    const statusId = 2;

    return expect(
      ProposalSettingsMutationsInstance.deleteProposalStatus(
        dummyUserOfficerWithRole,
        { id: statusId }
      )
    ).resolves.toHaveProperty('id', statusId);
  });

  test('A user can not create proposal workflow', async () => {
    const result =
      (await ProposalSettingsMutationsInstance.createProposalWorkflow(
        dummyUserWithRole,
        dummyProposalWorkflow
      )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can not create proposal workflow with bad input arguments', () => {
    return expect(
      ProposalSettingsMutationsInstance.createProposalWorkflow(
        dummyUserOfficerWithRole,
        {
          name: '',
          description: 'This is some small description',
        }
      )
    ).resolves.toHaveProperty('reason', 'Input validation errors');
  });

  test('A userofficer can create proposal workflow', () => {
    return expect(
      ProposalSettingsMutationsInstance.createProposalWorkflow(
        dummyUserOfficerWithRole,
        dummyProposalWorkflow
      )
    ).resolves.toStrictEqual(dummyProposalWorkflow);
  });

  test('A user cannot update proposal workflow', async () => {
    const result =
      (await ProposalSettingsMutationsInstance.updateProposalWorkflow(
        dummyUserWithRole,
        dummyProposalWorkflow
      )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can update proposal workflow', () => {
    return expect(
      ProposalSettingsMutationsInstance.updateProposalWorkflow(
        dummyUserOfficerWithRole,
        dummyProposalWorkflow
      )
    ).resolves.toStrictEqual(dummyProposalWorkflow);
  });

  test('A userofficer can remove proposal workflow', () => {
    return expect(
      ProposalSettingsMutationsInstance.deleteProposalWorkflow(
        dummyUserOfficerWithRole,
        { id: 1 }
      )
    ).resolves.toStrictEqual(dummyProposalWorkflow);
  });

  test('A userofficer can create new proposal workflow connection', () => {
    return expect(
      ProposalSettingsMutationsInstance.addProposalWorkflowStatus(
        dummyUserOfficerWithRole,
        dummyProposalWorkflowConnection
      )
    ).resolves.toStrictEqual(dummyProposalWorkflowConnection);
  });

  test('A userofficer can add next status event/s to workflow connection', () => {
    return expect(
      ProposalSettingsMutationsInstance.addStatusChangingEventsToConnection(
        dummyUserOfficerWithRole,
        {
          statusChangingEvents: ['PROPOSAL_SUBMITTED'],
          proposalWorkflowConnectionId: 1,
        }
      )
    ).resolves.toStrictEqual([dummyStatusChangingEvent]);
  });

  test('A userofficer can remove proposal workflow connection', () => {
    return expect(
      ProposalSettingsMutationsInstance.deleteProposalWorkflowStatus(
        dummyUserOfficerWithRole,
        {
          proposalStatusId: 1,
          proposalWorkflowId: 1,
          sortOrder: 0,
        }
      )
    ).resolves.toStrictEqual(true);
  });
});

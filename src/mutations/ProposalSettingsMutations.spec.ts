import 'reflect-metadata';
import { container } from 'tsyringe';

import {
  anotherDummyProposalStatus,
  dummyProposalStatus,
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
    const result = (await ProposalSettingsMutationsInstance.createProposalStatus(
      dummyUserWithRole,
      dummyProposalStatus
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
    return expect(
      ProposalSettingsMutationsInstance.createProposalStatus(
        dummyUserOfficerWithRole,
        dummyProposalStatus
      )
    ).resolves.toStrictEqual(dummyProposalStatus);
  });

  test('A user cannot update proposal status', async () => {
    const result = (await ProposalSettingsMutationsInstance.updateProposalStatus(
      dummyUserWithRole,
      dummyProposalStatus
    )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can update proposal status', () => {
    return expect(
      ProposalSettingsMutationsInstance.updateProposalStatus(
        dummyUserOfficerWithRole,
        anotherDummyProposalStatus
      )
    ).resolves.toStrictEqual(anotherDummyProposalStatus);
  });

  test('A userofficer can remove proposal status', () => {
    return expect(
      ProposalSettingsMutationsInstance.deleteProposalStatus(
        dummyUserOfficerWithRole,
        { id: 11 }
      )
    ).resolves.toStrictEqual(anotherDummyProposalStatus);
  });

  test('A user can not create proposal workflow', async () => {
    const result = (await ProposalSettingsMutationsInstance.createProposalWorkflow(
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
    const result = (await ProposalSettingsMutationsInstance.updateProposalWorkflow(
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

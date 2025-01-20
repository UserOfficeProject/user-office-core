import 'reflect-metadata';
import { container } from 'tsyringe';

import {
  dummyProposalWorkflow,
  dummyProposalWorkflowConnection,
} from '../datasources/mockups/ProposalSettingsDataSource';
import {
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import { Rejection } from '../models/Rejection';
import { StatusChangingEvent } from '../models/StatusChangingEvent';
import StatusMutations from './StatusMutations';
import WorkflowMutations from './WorkflowMutations';

const statusMutationsInstance = container.resolve(StatusMutations);

const workflowMutationsInstance = container.resolve(WorkflowMutations);

const dummyStatusChangingEvent = new StatusChangingEvent(
  1,
  1,
  'PROPOSAL_SUBMITTED',
  'proposal'
);

describe('Test Proposal settings mutations', () => {
  test('A user can not create proposal status', async () => {
    const result = (await statusMutationsInstance.createStatus(
      dummyUserWithRole,
      {
        shortCode: 'NEW',
        name: 'new',
        description: 'new',
        entityType: 'proposal',
      }
    )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can not create proposal status with bad input arguments', () => {
    return expect(
      statusMutationsInstance.createStatus(dummyUserOfficerWithRole, {
        shortCode: 'Test',
        name: 'Test',
        description: 'This is some small description',
        entityType: 'proposal',
      })
    ).resolves.toHaveProperty('reason', 'Input validation errors');
  });

  test('A userofficer can create proposal status', () => {
    const newStatus = {
      shortCode: 'NEW',
      name: 'NEW',
      description: 'NEW',
      entityType: 'proposal' as const,
    };

    return expect(
      statusMutationsInstance.createStatus(dummyUserOfficerWithRole, newStatus)
    ).resolves.toMatchObject(newStatus);
  });

  test('A user cannot update proposal status', async () => {
    const result = (await statusMutationsInstance.updateStatus(
      dummyUserWithRole,
      {
        id: 1,
        shortCode: 'UPDATE',
        name: 'update',
        description: 'update',
        isDefault: false,
        entityType: 'proposal' as const,
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
      entityType: 'proposal' as const,
    };

    return expect(
      statusMutationsInstance.updateStatus(
        dummyUserOfficerWithRole,
        updatedStatus
      )
    ).resolves.toMatchObject(updatedStatus);
  });

  test('A userofficer can remove proposal status', () => {
    const statusId = 2;

    return expect(
      statusMutationsInstance.deleteStatus(dummyUserOfficerWithRole, {
        id: statusId,
      })
    ).resolves.toHaveProperty('id', statusId);
  });

  test('A user can not create proposal workflow', async () => {
    const result = (await workflowMutationsInstance.createWorkflow(
      dummyUserWithRole,
      dummyProposalWorkflow
    )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can not create proposal workflow with bad input arguments', () => {
    return expect(
      workflowMutationsInstance.createWorkflow(dummyUserOfficerWithRole, {
        name: '',
        description: 'This is some small description',
        entityType: 'proposal',
      })
    ).resolves.toHaveProperty('reason', 'Input validation errors');
  });

  test('A userofficer can create proposal workflow', () => {
    return expect(
      workflowMutationsInstance.createWorkflow(
        dummyUserOfficerWithRole,
        dummyProposalWorkflow
      )
    ).resolves.toStrictEqual(dummyProposalWorkflow);
  });

  test('A user cannot update proposal workflow', async () => {
    const result = (await workflowMutationsInstance.updateWorkflow(
      dummyUserWithRole,
      dummyProposalWorkflow
    )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can update proposal workflow', () => {
    return expect(
      workflowMutationsInstance.updateWorkflow(
        dummyUserOfficerWithRole,
        dummyProposalWorkflow
      )
    ).resolves.toStrictEqual(dummyProposalWorkflow);
  });

  test('A userofficer can remove proposal workflow', () => {
    return expect(
      workflowMutationsInstance.deleteWorkflow(dummyUserOfficerWithRole, {
        id: 1,
      })
    ).resolves.toStrictEqual(dummyProposalWorkflow);
  });

  test('A userofficer can create new proposal workflow connection', () => {
    return expect(
      workflowMutationsInstance.addWorkflowStatus(
        dummyUserOfficerWithRole,
        dummyProposalWorkflowConnection
      )
    ).resolves.toStrictEqual(dummyProposalWorkflowConnection);
  });

  test('A userofficer can add next status event/s to workflow connection', () => {
    return expect(
      workflowMutationsInstance.addStatusChangingEventsToConnection(
        dummyUserOfficerWithRole,
        {
          statusChangingEvents: ['PROPOSAL_SUBMITTED'],
          workflowConnectionId: 1,
        }
      )
    ).resolves.toStrictEqual([dummyStatusChangingEvent]);
  });

  test('A userofficer can remove proposal workflow connection', () => {
    return expect(
      workflowMutationsInstance.deleteWorkflowStatus(dummyUserOfficerWithRole, {
        statusId: 1,
        workflowId: 1,
        sortOrder: 0,
        entityType: 'proposal',
      })
    ).resolves.toStrictEqual(true);
  });
});

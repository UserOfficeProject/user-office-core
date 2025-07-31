import { Status } from '../../models/Status';
import { StatusChangingEvent } from '../../models/StatusChangingEvent';
import { Workflow, WorkflowType } from '../../models/Workflow';
import {
  NextAndPreviousStatuses,
  WorkflowConnection,
  WorkflowConnectionWithStatus,
} from '../../models/WorkflowConnections';
import { AddWorkflowStatusInput } from '../../resolvers/mutations/settings/AddWorkflowStatusMutation';
import { CreateWorkflowInput } from '../../resolvers/mutations/settings/CreateWorkflowMutation';
import { WorkflowDataSource } from '../WorkflowDataSource';

export const dummyStatuses = [
  new Status(1, 'DRAFT', 'Draft', '', true, WorkflowType.PROPOSAL),
  new Status(
    2,
    'FEASIBILITY_REVIEW',
    'Feasibility review',
    '',
    true,
    WorkflowType.PROPOSAL
  ),
];
export const dummyWorkflow = new Workflow(
  1,
  'Test workflow',
  'This is description',
  WorkflowType.PROPOSAL,
  'default'
);

export const dummyWorkflowConnection = new WorkflowConnectionWithStatus(
  1,
  1,
  1,
  1,
  new Status(
    1,
    'TEST_STATUS',
    'Test status',
    'Test status',
    false,
    WorkflowType.PROPOSAL
  ),
  null,
  null,
  100,
  100
);

export const anotherDummyWorkflowConnection = new WorkflowConnectionWithStatus(
  2,
  2,
  1,
  2,
  new Status(
    2,
    'TEST_STATUS_2',
    'Test status 2',
    'Test status 2',
    false,
    WorkflowType.PROPOSAL
  ),
  null,
  1,
  200,
  150
);

export const dummyStatusChangingEvent = new StatusChangingEvent(
  1,
  1,
  'PROPOSAL_SUBMITTED'
);

export class WorkflowDataSourceMock implements WorkflowDataSource {
  async createWorkflow(args: CreateWorkflowInput): Promise<Workflow> {
    return dummyWorkflow;
  }

  async getWorkflow(WorkflowId: number): Promise<Workflow | null> {
    return dummyWorkflow;
  }

  async getWorkflowByCall(callId: number): Promise<Workflow | null> {
    return dummyWorkflow;
  }

  async getAllWorkflows(): Promise<Workflow[]> {
    return [dummyWorkflow];
  }

  async updateWorkflow(Workflow: Workflow): Promise<Workflow> {
    return dummyWorkflow;
  }

  async deleteWorkflow(WorkflowId: number): Promise<Workflow> {
    return dummyWorkflow;
  }

  async getWorkflowConnections(
    workflowId: number
  ): Promise<WorkflowConnectionWithStatus[]> {
    return [dummyWorkflowConnection, anotherDummyWorkflowConnection];
  }

  async getWorkflowConnection(
    connectionId: number
  ): Promise<WorkflowConnectionWithStatus | null> {
    if (connectionId === dummyWorkflowConnection.id) {
      return dummyWorkflowConnection;
    }
    if (connectionId === anotherDummyWorkflowConnection.id) {
      return anotherDummyWorkflowConnection;
    }

    return null;
  }

  async getWorkflowConnectionsById(
    workflowId: number,
    workflowConnectionId: number,
    { nextStatusId, prevStatusId, sortOrder }: NextAndPreviousStatuses
  ): Promise<WorkflowConnectionWithStatus[]> {
    return [dummyWorkflowConnection];
  }

  async addWorkflowStatus(
    newWorkflowStatusInput: AddWorkflowStatusInput
  ): Promise<WorkflowConnectionWithStatus> {
    return dummyWorkflowConnection;
  }

  async updateWorkflowStatus(
    workflowStatus: WorkflowConnection
  ): Promise<WorkflowConnectionWithStatus> {
    return dummyWorkflowConnection;
  }

  async deleteWorkflowStatus(
    statusId: number,
    workflowId: number,
    sortOrder: number
  ): Promise<WorkflowConnectionWithStatus> {
    return dummyWorkflowConnection;
  }

  async deleteWorkflowConnection(
    connectionId: number
  ): Promise<WorkflowConnection | null> {
    if (connectionId === dummyWorkflowConnection.id) {
      return dummyWorkflowConnection;
    }
    if (connectionId === anotherDummyWorkflowConnection.id) {
      return anotherDummyWorkflowConnection;
    }

    return null;
  }

  async addStatusChangingEventsToConnection(
    workflowConnectionId: number,
    statusChangingEvents: string[]
  ): Promise<StatusChangingEvent[]> {
    return [dummyStatusChangingEvent];
  }

  async getStatusChangingEventsByConnectionIds(
    workflowConnectionIds: number[]
  ): Promise<StatusChangingEvent[]> {
    return [dummyStatusChangingEvent];
  }
}

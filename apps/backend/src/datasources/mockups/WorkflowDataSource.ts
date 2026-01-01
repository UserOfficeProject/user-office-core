import { Status } from '../../models/Status';
import { StatusChangingEvent } from '../../models/StatusChangingEvent';
import { Workflow, WorkflowType } from '../../models/Workflow';
import { WorkflowConnection } from '../../models/WorkflowConnections';
import { WorkflowStatus } from '../../models/WorkflowStatus';
import { AddStatusToWorkflowInput } from '../../resolvers/mutations/settings/AddStatusToWorkflowMutation';
import { CreateWorkflowConnectionInput } from '../../resolvers/mutations/settings/CreateWorkflowConnectionMutation';
import { CreateWorkflowInput } from '../../resolvers/mutations/settings/CreateWorkflowMutation';
import { UpdateWorkflowInput } from '../../resolvers/mutations/settings/UpdateWorkflowMutation';
import { UpdateWorkflowStatusInput } from '../../resolvers/mutations/settings/UpdateWorkflowStatusMutation';
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

export const dummyWorkflowConnection = new WorkflowConnection(1, 1, 1, 2);

export const anotherDummyWorkflowConnection = new WorkflowConnection(
  2,
  1,
  2,
  1
);

export const dummyWorkflowStatus = new WorkflowStatus(1, 1, 1, 100, 100);

export const dummyStatusChangingEvent = new StatusChangingEvent(
  1,
  'PROPOSAL_SUBMITTED'
);

export class WorkflowDataSourceMock implements WorkflowDataSource {
  getWorkflowStructure(workflowId: number): Promise<{
    workflowStatuses: {
      workflowStatusId: number;
      statusId: number;
      shortCode: string;
    }[];
    workflowConnections: {
      prevWorkflowStatusId: number;
      nextWorkflowStatusId: number;
      statusChangingEvent: string;
    }[];
  }> {
    throw new Error('Method not implemented.');
  }
  createWorkflowConnection(
    newWorkflowConnectionInput: CreateWorkflowConnectionInput
  ): Promise<WorkflowConnection> {
    throw new Error('Method not implemented.');
  }
  getWorkflowStatus(workflowStatusId: number): Promise<WorkflowStatus | null> {
    throw new Error('Method not implemented.');
  }
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

  async updateWorkflow(Workflow: UpdateWorkflowInput): Promise<Workflow> {
    return dummyWorkflow;
  }

  async deleteWorkflow(WorkflowId: number): Promise<Workflow> {
    return dummyWorkflow;
  }

  async getWorkflowConnections(
    workflowId: number
  ): Promise<WorkflowConnection[]> {
    return [dummyWorkflowConnection, anotherDummyWorkflowConnection];
  }

  async getWorkflowStatuses(workflowId: number): Promise<WorkflowStatus[]> {
    return [dummyWorkflowStatus];
  }

  async getWorkflowConnection(
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

  async addStatusToWorkflow(
    newWorkflowStatusInput: AddStatusToWorkflowInput
  ): Promise<WorkflowStatus> {
    return dummyWorkflowStatus;
  }

  async updateWorkflowStatus(
    workflowStatus: UpdateWorkflowStatusInput
  ): Promise<WorkflowStatus> {
    return dummyWorkflowStatus;
  }

  async deleteWorkflowStatus(
    workflowStatusId: number
  ): Promise<WorkflowStatus> {
    return dummyWorkflowStatus;
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

  async setStatusChangingEventsOnConnection(
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

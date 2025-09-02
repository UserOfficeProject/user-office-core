import { Status } from '../../models/Status';
import { StatusChangingEvent } from '../../models/StatusChangingEvent';
import { Workflow, WorkflowStatus, WorkflowType } from '../../models/Workflow';
import { WorkflowConnection } from '../../models/Workflow';
import { AddStatusToWorkflowArgs } from '../../resolvers/mutations/settings/AddStatusToWorkflowMutation';
import { CreateWorkflowInput } from '../../resolvers/mutations/settings/CreateWorkflowMutation';
import { UpdateWorkflowInput } from '../../resolvers/mutations/settings/UpdateWorkflowMutation';
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

export const dummyWorkflowConnection = new WorkflowConnection(1, 1, 1, 1);
export const dummyWorkflowStatus = new WorkflowStatus(1, 1, 1, 0, 0);

export const anotherDummyWorkflowConnection = new WorkflowConnection(
  2,
  2,
  1,
  2
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

  async getWorkflowStatuses(workflowId: number): Promise<WorkflowStatus[]> {
    return [dummyWorkflowStatus];
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
    newWorkflowStatusInput: AddStatusToWorkflowArgs
  ): Promise<WorkflowStatus> {
    return dummyWorkflowStatus;
  }

  async updateWorkflowStatus(
    workflowStatus: WorkflowStatus
  ): Promise<WorkflowStatus> {
    return dummyWorkflowStatus;
  }

  async deleteWorkflowStatus(
    statusId: number,
    workflowId: number,
    sortOrder: number
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

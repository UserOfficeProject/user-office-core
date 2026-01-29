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
import { WorkflowStructure } from '../postgres/records';
import { WorkflowDataSource } from '../WorkflowDataSource';
import { dummyWorkflowStatuses } from './StatusDataSource';

export const dummyWorkflow = new Workflow(
  1,
  'Test workflow',
  'This is description',
  WorkflowType.PROPOSAL,
  'default'
);

export const dummyStatuses = [
  new Status('DRAFT', 'Draft', '', true, WorkflowType.PROPOSAL),
  new Status(
    'FEASIBILITY_REVIEW',
    'Feasibility review',
    '',
    true,
    WorkflowType.PROPOSAL
  ),
];

export const dummyWorkflowConnections = [
  new WorkflowConnection(1, 1, 1, 2, 'bottom-source', 'top-target'),
  new WorkflowConnection(2, 1, 2, 1, 'bottom-source', 'top-target'),
];

export const dummyStatusChangingEvent = new StatusChangingEvent(
  1,
  'PROPOSAL_SUBMITTED'
);

export class WorkflowDataSourceMock implements WorkflowDataSource {
  async getWorkflowStructure(workflowId: number): Promise<WorkflowStructure> {
    return {
      workflowStatuses: dummyWorkflowStatuses.map((ws) => ({
        workflowStatusId: ws.workflowStatusId,
        statusId: ws.statusId,
        shortCode: dummyStatuses.find((s) => s.id === ws.statusId)?.id || '',
      })),
      workflowConnections: dummyWorkflowConnections.map((wc) => ({
        workflowStatusConnectionId: wc.id,
        prevWorkflowStatusId: wc.prevWorkflowStatusId,
        nextWorkflowStatusId: wc.nextWorkflowStatusId,
        statusChangingEvents: ['PROPOSAL_SUBMITTED'],
      })),
    };
  }
  async createWorkflowConnection(
    newWorkflowConnectionInput: CreateWorkflowConnectionInput
  ): Promise<WorkflowConnection> {
    return dummyWorkflowConnections[0];
  }
  async getWorkflowStatus(
    workflowStatusId: number
  ): Promise<WorkflowStatus | null> {
    return (
      dummyWorkflowStatuses.find(
        (ws) => ws.workflowStatusId === workflowStatusId
      ) || null
    );
  }

  async getDefaultWorkflowStatus(
    workflowId: number
  ): Promise<WorkflowStatus | null> {
    return dummyWorkflowStatuses[0];
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

  async updateWorkflowTimestamp(workflowId: number): Promise<void> {
    return;
  }

  async deleteWorkflow(WorkflowId: number): Promise<Workflow> {
    return dummyWorkflow;
  }

  async getWorkflowConnections(
    workflowId: number
  ): Promise<WorkflowConnection[]> {
    return dummyWorkflowConnections;
  }

  async getWorkflowStatuses(workflowId: number): Promise<WorkflowStatus[]> {
    return dummyWorkflowStatuses;
  }

  async getWorkflowConnection(
    connectionId: number
  ): Promise<WorkflowConnection | null> {
    return dummyWorkflowConnections.find(
      (conn) => conn.id === connectionId
    ) as WorkflowConnection;
  }

  async addStatusToWorkflow(
    newWorkflowStatusInput: AddStatusToWorkflowInput
  ): Promise<WorkflowStatus> {
    return dummyWorkflowStatuses[0];
  }

  async updateWorkflowStatus(
    workflowStatus: UpdateWorkflowStatusInput
  ): Promise<WorkflowStatus> {
    return dummyWorkflowStatuses[0];
  }

  async deleteWorkflowStatus(
    workflowStatusId: number
  ): Promise<WorkflowStatus> {
    return dummyWorkflowStatuses[0];
  }

  async deleteWorkflowConnection(
    connectionId: number
  ): Promise<WorkflowConnection | null> {
    return dummyWorkflowConnections.find(
      (conn) => conn.id === connectionId
    ) as WorkflowConnection;
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

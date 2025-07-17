import { Status } from '../models/Status';
import { StatusChangingEvent } from '../models/StatusChangingEvent';
import { Workflow } from '../models/Workflow';
import {
  NextAndPreviousStatuses,
  WorkflowConnection,
  WorkflowConnectionWithStatus,
} from '../models/WorkflowConnections';

export interface WorkflowDataSource {
  createWorkflow(newWorkflowInput: Omit<Workflow, 'id'>): Promise<Workflow>;
  getWorkflow(workflowId: number): Promise<Workflow | null>;
  getAllWorkflows(entityType: Workflow['entityType']): Promise<Workflow[]>;
  updateWorkflow(workflow: Omit<Workflow, 'entityType'>): Promise<Workflow>;
  deleteWorkflow(workflowId: number): Promise<Workflow>;
  getWorkflowConnections(
    workflowId: WorkflowConnection['workflowId']
  ): Promise<WorkflowConnectionWithStatus[]>;
  getWorkflowConnection(
    connectionId: WorkflowConnection['id']
  ): Promise<WorkflowConnectionWithStatus | null>;
  getWorkflowConnectionsById(
    workflowId: WorkflowConnection['workflowId'],
    statusId: Status['id'],
    { nextStatusId, prevStatusId, sortOrder }: NextAndPreviousStatuses
  ): Promise<WorkflowConnectionWithStatus[]>;
  addWorkflowStatus(
    newWorkflowStatusInput: Omit<WorkflowConnection, 'id' | 'entityType'>
  ): Promise<WorkflowConnectionWithStatus>;
  updateWorkflowStatus(
    workflowStatuses: WorkflowConnection
  ): Promise<WorkflowConnectionWithStatus>;
  deleteWorkflowStatus(
    statusId: number,
    workflowId: number,
    sortOrder: number
  ): Promise<WorkflowConnection>;
  addStatusChangingEventsToConnection(
    workflowConnectionId: number,
    statusChangingEvents: string[]
  ): Promise<StatusChangingEvent[]>;
  getStatusChangingEventsByConnectionIds(
    workflowConnectionIds: number[]
  ): Promise<StatusChangingEvent[]>;
}

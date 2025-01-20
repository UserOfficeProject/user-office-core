import { Status } from '../models/ProposalStatus';
import { Workflow } from '../models/ProposalWorkflow';
import {
  NextAndPreviousStatuses,
  WorkflowConnection,
  WorkflowConnectionWithStatus,
} from '../models/ProposalWorkflowConnections';
import { StatusChangingEvent } from '../models/StatusChangingEvent';

export interface WorkflowDataSource {
  createWorkflow(newWorkflowInput: Omit<Workflow, 'id'>): Promise<Workflow>;
  getWorkflow(
    workflowId: number,
    entityType: Workflow['entityType']
  ): Promise<Workflow | null>;
  getAllWorkflows(entityType: Workflow['entityType']): Promise<Workflow[]>;
  updateWorkflow(workflow: Omit<Workflow, 'entityType'>): Promise<Workflow>;
  deleteWorkflow(workflowId: number): Promise<Workflow>;
  getWorkflowConnections(
    workflowId: WorkflowConnection['workflowId'],
    entityType: WorkflowConnection['entityType'],
    droppableGroupId?: WorkflowConnection['droppableGroupId'],
    byParentGroupId?: boolean | undefined
  ): Promise<WorkflowConnectionWithStatus[]>;
  getWorkflowConnectionsById(
    workflowId: WorkflowConnection['workflowId'],
    statusId: Status['id'],
    entityType: WorkflowConnection['entityType'],
    { nextStatusId, prevStatusId, sortOrder }: NextAndPreviousStatuses
  ): Promise<WorkflowConnectionWithStatus[]>;
  addWorkflowStatus(
    newWorkflowStatusInput: Omit<WorkflowConnection, 'id'>
  ): Promise<WorkflowConnectionWithStatus>;
  updateWorkflowStatuses(
    workflowStatuses: WorkflowConnection[]
  ): Promise<WorkflowConnectionWithStatus[]>;
  deleteWorkflowStatus(
    statusId: number,
    workflowId: number,
    sortOrder: number
  ): Promise<WorkflowConnectionWithStatus>;
  addStatusChangingEventsToConnection(
    workflowConnectionId: number,
    statusChangingEvents: string[]
  ): Promise<StatusChangingEvent[]>;
  getStatusChangingEventsByConnectionIds(
    workflowConnectionIds: number[],
    entityType: StatusChangingEvent['entityType']
  ): Promise<StatusChangingEvent[]>;
}

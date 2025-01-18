import { Status } from '../models/ProposalStatus';
import { Workflow } from '../models/ProposalWorkflow';
import {
  NextAndPreviousStatuses,
  WorkflowConnection,
} from '../models/ProposalWorkflowConnections';
import { StatusChangingEvent } from '../models/StatusChangingEvent';

export interface WorkflowDataSource {
  createWorkflow(newWorkflowInput: Omit<Workflow, 'id'>): Promise<Workflow>;
  getWorkflow(
    workflowId: number,
    entityType: Workflow['entityType']
  ): Promise<Workflow | null>;
  getAllWorkflows(entityType: Workflow['entityType']): Promise<Workflow[]>;
  updateWorkflow(workflow: Workflow): Promise<Workflow>;
  deleteWorkflow(workflowId: number): Promise<Workflow>;
  getWorkflowConnections(
    workflowId: WorkflowConnection['workflowId'],
    entityType: WorkflowConnection['entityType'],
    droppableGroupId?: WorkflowConnection['droppableGroupId'],
    byParentGroupId?: WorkflowConnection['parentDroppableGroupId']
  ): Promise<WorkflowConnection[]>;
  getWorkflowConnectionsById(
    workflowId: WorkflowConnection['workflowId'],
    statusId: Status['id'],
    entityType: WorkflowConnection['entityType'],
    { nextStatusId, prevStatusId, sortOrder }: NextAndPreviousStatuses
  ): Promise<WorkflowConnection[]>;
  addWorkflowStatus(
    newWorkflowStatusInput: Omit<WorkflowConnection, 'id'>
  ): Promise<WorkflowConnection>;
  updateWorkflowStatuses(
    workflowStatuses: WorkflowConnection[]
  ): Promise<WorkflowConnection[]>;
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
    workflowConnectionIds: number[],
    entityType: StatusChangingEvent['entityType']
  ): Promise<StatusChangingEvent[]>;
}

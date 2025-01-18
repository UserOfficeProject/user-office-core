import { Status } from '../../models/ProposalStatus';
import { Workflow } from '../../models/ProposalWorkflow';
import {
  WorkflowConnection,
  NextAndPreviousStatuses,
} from '../../models/ProposalWorkflowConnections';
import { StatusChangingEvent } from '../../models/StatusChangingEvent';
import { WorkflowDataSource } from '../WorkflowDataSource';

export class WorkflowDataSourceMock implements WorkflowDataSource {
  //TODO: This needs to be implemented
  createWorkflow(newWorkflowInput: Omit<Workflow, 'id'>): Promise<Workflow> {
    throw new Error('Method not implemented.');
  }
  getWorkflow(workflowId: number): Promise<Workflow | null> {
    throw new Error('Method not implemented.');
  }
  getAllWorkflows(entityType: Workflow['entityType']): Promise<Workflow[]> {
    throw new Error('Method not implemented.');
  }
  updateWorkflow(workflow: Omit<Workflow, 'entityType'>): Promise<Workflow> {
    throw new Error('Method not implemented.');
  }
  deleteWorkflow(workflowId: number): Promise<Workflow> {
    throw new Error('Method not implemented.');
  }
  getWorkflowConnections(
    workflowId: WorkflowConnection['workflowId'],
    droppableGroupId?: WorkflowConnection['droppableGroupId'],
    byParentGroupId?: WorkflowConnection['parentDroppableGroupId'],
    entityType?: WorkflowConnection['entityType']
  ): Promise<WorkflowConnection[]> {
    throw new Error('Method not implemented.');
  }
  getWorkflowConnectionsById(
    workflowId: WorkflowConnection['workflowId'],
    statusId: Status['id'],
    entityType: WorkflowConnection['entityType'],
    { nextStatusId, prevStatusId, sortOrder }: NextAndPreviousStatuses
  ): Promise<WorkflowConnection[]> {
    throw new Error('Method not implemented.');
  }
  addWorkflowStatus(
    newWorkflowStatusInput: Omit<WorkflowConnection, 'id'>
  ): Promise<WorkflowConnection> {
    throw new Error('Method not implemented.');
  }
  updateWorkflowStatuses(
    workflowStatuses: WorkflowConnection[]
  ): Promise<WorkflowConnection[]> {
    throw new Error('Method not implemented.');
  }
  deleteWorkflowStatus(
    statusId: number,
    workflowId: number,
    sortOrder: number
  ): Promise<WorkflowConnection> {
    throw new Error('Method not implemented.');
  }
  addStatusChangingEventsToConnection(
    workflowConnectionId: number,
    statusChangingEvents: string[]
  ): Promise<StatusChangingEvent[]> {
    throw new Error('Method not implemented.');
  }
  getStatusChangingEventsByConnectionIds(
    workflowConnectionIds: number[]
  ): Promise<StatusChangingEvent[]> {
    throw new Error('Method not implemented.');
  }
  createStatus(
    newStatusInput: Omit<Status, 'id' | 'is_default'>
  ): Promise<Status> {
    throw new Error('Method not implemented.');
  }
  getStatus(statusId: number): Promise<Status | null> {
    throw new Error('Method not implemented.');
  }
  getAllStatuses(): Promise<Status[]> {
    throw new Error('Method not implemented.');
  }
  updateStatus(proposalStatus: Status): Promise<Status> {
    throw new Error('Method not implemented.');
  }
  deleteProposalStatus(statusId: number): Promise<Status> {
    throw new Error('Method not implemented.');
  }
}

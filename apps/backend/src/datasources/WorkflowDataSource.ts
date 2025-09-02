import { StatusChangingEvent } from '../models/StatusChangingEvent';
import {
  Workflow,
  WorkflowConnection,
  WorkflowStatus,
} from '../models/Workflow';
import { AddStatusToWorkflowArgs } from '../resolvers/mutations/settings/AddStatusToWorkflowMutation';
import { CreateWorkflowConnectionArgs } from '../resolvers/mutations/settings/CreateWorkflowConnectionMutation';
import { CreateWorkflowInput } from '../resolvers/mutations/settings/CreateWorkflowMutation';
import { UpdateWorkflowInput } from '../resolvers/mutations/settings/UpdateWorkflowMutation';
import { UpdateWorkflowStatusArgs } from '../resolvers/mutations/settings/UpdateWorkflowStatusMutation';

export interface WorkflowDataSource {
  createWorkflow(newWorkflowInput: CreateWorkflowInput): Promise<Workflow>;
  getWorkflow(workflowId: number): Promise<Workflow | null>;
  getAllWorkflows(entityType: Workflow['entityType']): Promise<Workflow[]>;
  updateWorkflow(workflow: UpdateWorkflowInput): Promise<Workflow>;
  deleteWorkflow(workflowId: number): Promise<Workflow>;
  deleteWorkflowConnection(
    connectionId: number
  ): Promise<WorkflowConnection | null>;
  getWorkflowConnections(
    workflowId: WorkflowConnection['workflowId']
  ): Promise<WorkflowConnection[]>;
  getWorkflowStatuses(proposalWorkflowId: number): Promise<WorkflowStatus[]>;
  getWorkflowConnection(
    connectionId: WorkflowConnection['id']
  ): Promise<WorkflowConnection | null>;
  addStatusToWorkflow(input: AddStatusToWorkflowArgs): Promise<WorkflowStatus>;
  removeStatusFromWorkflow(workflowStatusId: number): Promise<WorkflowStatus>;
  updateWorkflowStatus(
    input: UpdateWorkflowStatusArgs
  ): Promise<WorkflowStatus>;
  createWorkflowConnection(
    args: CreateWorkflowConnectionArgs
  ): Promise<WorkflowConnection>;
  deleteWorkflowStatus(
    statusId: number,
    workflowId: number,
    sortOrder: number
  ): Promise<WorkflowStatus>;
  addStatusChangingEventsToConnection(
    workflowConnectionId: number,
    statusChangingEvents: string[]
  ): Promise<StatusChangingEvent[]>;
  getStatusChangingEventsByConnectionIds(
    workflowConnectionIds: number[]
  ): Promise<StatusChangingEvent[]>;
}

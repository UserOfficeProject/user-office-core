import { StatusChangingEvent } from '../models/StatusChangingEvent';
import { Workflow } from '../models/Workflow';
import { WorkflowConnection } from '../models/WorkflowConnections';
import { WorkflowStatus } from '../models/WorkflowStatus';
import { WorkflowStructure } from './postgres/records';
import { AddStatusToWorkflowInput } from '../resolvers/mutations/settings/AddStatusToWorkflowMutation';
import { CreateWorkflowConnectionInput } from '../resolvers/mutations/settings/CreateWorkflowConnectionMutation';
import { CreateWorkflowInput } from '../resolvers/mutations/settings/CreateWorkflowMutation';
import { UpdateWorkflowInput } from '../resolvers/mutations/settings/UpdateWorkflowMutation';
import { UpdateWorkflowStatusInput } from '../resolvers/mutations/settings/UpdateWorkflowStatusMutation';

export interface WorkflowDataSource {
  createWorkflow(newWorkflowInput: CreateWorkflowInput): Promise<Workflow>;
  getWorkflow(workflowId: number): Promise<Workflow | null>;
  getAllWorkflows(entityType: Workflow['entityType']): Promise<Workflow[]>;
  updateWorkflow(workflow: UpdateWorkflowInput): Promise<Workflow>;
  updateWorkflowTimestamp(workflowId: number): Promise<void>;
  deleteWorkflow(workflowId: number): Promise<Workflow>;
  cloneWorkflow(workflowId: number): Promise<Workflow>;

  createWorkflowConnection(
    newWorkflowConnectionInput: CreateWorkflowConnectionInput
  ): Promise<WorkflowConnection>;
  getWorkflowConnection(
    connectionId: WorkflowConnection['id']
  ): Promise<WorkflowConnection | null>;
  getWorkflowConnections(
    workflowId: WorkflowConnection['workflowId']
  ): Promise<WorkflowConnection[]>;
  deleteWorkflowConnection(
    connectionId: number
  ): Promise<WorkflowConnection | null>;

  addStatusToWorkflow(
    newWorkflowStatusInput: AddStatusToWorkflowInput
  ): Promise<WorkflowStatus>;
  getWorkflowStatus(workflowStatusId: number): Promise<WorkflowStatus | null>;
  getWorkflowStatuses(workflowId: number): Promise<WorkflowStatus[]>;
  updateWorkflowStatus(
    workflowStatus: UpdateWorkflowStatusInput
  ): Promise<WorkflowStatus>;
  deleteWorkflowStatus(workflowStatusId: number): Promise<WorkflowStatus>;

  getInitialWorkflowStatus(workflowId: number): Promise<WorkflowStatus | null>;

  setStatusChangingEventsOnConnection(
    workflowConnectionId: number,
    statusChangingEvents: string[]
  ): Promise<StatusChangingEvent[]>;
  getStatusChangingEventsByConnectionIds(
    workflowConnectionIds: number[]
  ): Promise<StatusChangingEvent[]>;

  getWorkflowStructure(workflowId: number): Promise<WorkflowStructure>;
}

import { StatusChangingEvent } from '../models/StatusChangingEvent';
import { Workflow } from '../models/Workflow';
import { WorkflowConnection } from '../models/WorkflowConnections';
import { WorkflowStatus } from '../models/WorkflowStatus';
import { CreateWorkflowConnectionInput } from '../resolvers/mutations/settings/CreateWorkflowConnectionMutation';
import { CreateWorkflowInput } from '../resolvers/mutations/settings/CreateWorkflowMutation';
import { UpdateWorkflowInput } from '../resolvers/mutations/settings/UpdateWorkflowMutation';
import { UpdateWorkflowStatusInput } from '../resolvers/mutations/settings/UpdateWorkflowStatusMutation';

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
  getWorkflowStatuses(workflowId: number): Promise<WorkflowStatus[]>;
  getWorkflowStatus(workflowStatusId: number): Promise<WorkflowStatus | null>;
  getWorkflowConnection(
    connectionId: WorkflowConnection['id']
  ): Promise<WorkflowConnection | null>;
  addStatusToWorkflow(newWorkflowStatusInput: {
    workflowId: number;
    statusId: number;
    posX: number;
    posY: number;
  }): Promise<WorkflowStatus>;
  createWorkflowConnection(
    newWorkflowConnectionInput: CreateWorkflowConnectionInput
  ): Promise<WorkflowConnection>;
  updateWorkflowStatus(
    workflowStatus: UpdateWorkflowStatusInput
  ): Promise<WorkflowStatus>;
  deleteWorkflowStatus(workflowStatusId: number): Promise<WorkflowStatus>;
  setStatusChangingEventsOnConnection(
    workflowConnectionId: number,
    statusChangingEvents: string[]
  ): Promise<StatusChangingEvent[]>;
  getStatusChangingEventsByConnectionIds(
    workflowConnectionIds: number[]
  ): Promise<StatusChangingEvent[]>;
}

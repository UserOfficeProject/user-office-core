import { Status } from '../models/Status';
import { WorkflowStatus } from '../models/WorkflowStatus';
import { UpdateStatusInput } from '../resolvers/mutations/settings/UpdateStatusMutation';

export interface StatusDataSource {
  createStatus(
    newStatusInput: Omit<Status, 'id' | 'isDefault'>
  ): Promise<Status>;
  getStatus(statusId: string): Promise<Status | null>;
  getWorkflowStatus(workflowStatusId: number): Promise<WorkflowStatus | null>;
  getAllStatuses(entityType: Status['entityType']): Promise<Status[]>;
  updateStatus(status: UpdateStatusInput): Promise<Status>;
  deleteStatus(statusId: string): Promise<Status>;
  getDefaultStatus(entityType: Status['entityType']): Promise<Status | null>;
  getDefaultWorkflowStatus(workflowId: number): Promise<WorkflowStatus | null>;
}

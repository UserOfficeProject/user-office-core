import { Status } from '../models/Status';
import { UpdateStatusInput } from '../resolvers/mutations/settings/UpdateStatusMutation';

export interface StatusDataSource {
  createStatus(newStatusInput: Omit<Status, 'isDefault'>): Promise<Status>;
  getStatus(statusId: string): Promise<Status | null>;
  getStatusByWorkflowStatusId(workflowStatusId: number): Promise<Status | null>;
  getAllStatuses(entityType: Status['entityType']): Promise<Status[]>;
  updateStatus(status: UpdateStatusInput): Promise<Status>;
  deleteStatus(statusId: string): Promise<Status>;
  getInitialStatus(entityType: Status['entityType']): Promise<Status | null>;
}

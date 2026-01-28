import { Status } from '../models/Status';
import { UpdateStatusInput } from '../resolvers/mutations/settings/UpdateStatusMutation';

export interface StatusDataSource {
  createStatus(newStatusInput: Omit<Status, 'isDefault'>): Promise<Status>;
  getStatus(statusId: string): Promise<Status | null>;
  getAllStatuses(entityType: Status['entityType']): Promise<Status[]>;
  updateStatus(status: UpdateStatusInput): Promise<Status>;
  deleteStatus(statusId: string): Promise<Status>;
  getDefaultStatus(entityType: Status['entityType']): Promise<Status | null>;
}

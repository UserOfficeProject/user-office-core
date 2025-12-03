import { Status } from '../models/Status';
import { UpdateStatusInput } from '../resolvers/mutations/settings/UpdateStatusMutation';

export interface StatusDataSource {
  createStatus(
    newStatusInput: Omit<Status, 'id' | 'isDefault'>
  ): Promise<Status>;
  getStatus(statusId: number): Promise<Status | null>;
  getAllStatuses(entityType: Status['entityType']): Promise<Status[]>;
  updateStatus(status: UpdateStatusInput): Promise<Status>;
  deleteStatus(statusId: number): Promise<Status>;
  getDefaultStatus(entityType: Status['entityType']): Promise<Status | null>;
}

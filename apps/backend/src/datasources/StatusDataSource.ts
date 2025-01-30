import { Status } from '../models/Status';

export interface StatusDataSource {
  createStatus(
    newStatusInput: Omit<Status, 'id' | 'isDefault'>
  ): Promise<Status>;
  getStatus(statusId: number): Promise<Status | null>;
  getAllStatuses(entityType: Status['entityType']): Promise<Status[]>;
  updateStatus(status: Omit<Status, 'entityType'>): Promise<Status>;
  deleteStatus(statusId: number): Promise<Status>;
}

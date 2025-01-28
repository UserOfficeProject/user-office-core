import { Status } from '../models/ProposalStatus'; //TODO: Create a new file for the Status model

export interface StatusDataSource {
  createStatus(
    newStatusInput: Omit<Status, 'id' | 'isDefault'>
  ): Promise<Status>;
  getStatus(statusId: number): Promise<Status | null>;
  getAllStatuses(entityType: Status['entityType']): Promise<Status[]>;
  updateStatus(proposalStatus: Omit<Status, 'entityType'>): Promise<Status>;
  deleteStatus(statusId: number): Promise<Status>;
}

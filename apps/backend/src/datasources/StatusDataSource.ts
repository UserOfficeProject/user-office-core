import { Status } from '../models/ProposalStatus'; //TODO: Create a new file for the Status model

export interface StatusDataSource {
  createStatus(
    newStatusInput: Omit<Status, 'id' | 'isDefault'>
  ): Promise<Status>;
  getStatus(
    statusId: number,
    entityType: Status['entityType']
  ): Promise<Status | null>;
  getAllStatuses(entityType: Status['entityType']): Promise<Status[]>;
  updateStatus(proposalStatus: Status): Promise<Status>;
  deleteStatus(statusId: number): Promise<Status>;
}

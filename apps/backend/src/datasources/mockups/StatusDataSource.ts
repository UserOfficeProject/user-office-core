import { Status } from '../../models/ProposalStatus';
import { StatusDataSource } from '../StatusDataSource';

export class StatusDataSourceMock implements StatusDataSource {
  // TODO: This needs to be implemented
  createStatus(
    newStatusInput: Omit<Status, 'id' | 'is_default'>
  ): Promise<Status> {
    throw new Error('Method not implemented.');
  }
  getStatus(statusId: number): Promise<Status | null> {
    throw new Error('Method not implemented.');
  }
  getAllStatuses(): Promise<Status[]> {
    throw new Error('Method not implemented.');
  }
  updateStatus(proposalStatus: Status): Promise<Status> {
    throw new Error('Method not implemented.');
  }
  deleteProposalStatus(statusId: number): Promise<Status> {
    throw new Error('Method not implemented.');
  }
}

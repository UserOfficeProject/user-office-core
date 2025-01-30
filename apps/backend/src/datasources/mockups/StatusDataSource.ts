import { Status } from '../../models/Status';
import { WorkflowType } from '../../models/Workflow';
import { StatusDataSource } from '../StatusDataSource';

export const dummyStatuses = [
  new Status(1, 'DRAFT', 'Draft', '', true, WorkflowType.PROPOSAL),
  new Status(
    2,
    'FEASIBILITY_REVIEW',
    'Feasibility review',
    '',
    true,
    WorkflowType.PROPOSAL
  ),
];

export class StatusDataSourceMock implements StatusDataSource {
  // TODO: This needs to be implemented
  async createStatus(
    newStatusInput: Omit<Status, 'id' | 'is_default'>
  ): Promise<Status> {
    return { ...newStatusInput, id: 1, isDefault: false };
  }
  async getStatus(statusId: number): Promise<Status | null> {
    return dummyStatuses.find((s) => s.id === statusId) as Status;
  }
  async getAllStatuses(): Promise<Status[]> {
    return dummyStatuses;
  }
  async updateStatus(status: Omit<Status, 'entityType'>): Promise<Status> {
    return { ...status, entityType: WorkflowType.PROPOSAL };
  }
  async deleteStatus(statusId: number): Promise<Status> {
    return dummyStatuses.splice(
      dummyStatuses.findIndex((s) => s.id === statusId),
      1
    )[0];
  }
}

import { Status } from '../../models/Status';
import { WorkflowType } from '../../models/Workflow';
import { WorkflowStatus } from '../../models/WorkflowStatus';
import { StatusDataSource } from '../StatusDataSource';

export const dummyStatuses = [
  new Status('DRAFT', 'Draft', '', true, WorkflowType.PROPOSAL),
  new Status(
    'FEASIBILITY_REVIEW',
    'Feasibility review',
    '',
    true,
    WorkflowType.PROPOSAL
  ),
];

export const dummyWorkflowStatuses = [
  new WorkflowStatus(1, 1, 'DRAFT', 0, 0),
  new WorkflowStatus(2, 1, 'FEASIBILITY_REVIEW', 0, 0),
  new WorkflowStatus(3, 1, 'APPROVED', 0, 0),
  new WorkflowStatus(4, 1, 'UNSUCCESSFUL', 0, 0),
  new WorkflowStatus(5, 1, 'FINISHED', 0, 0),
  new WorkflowStatus(6, 1, 'NON-TP', 0, 0),
  new WorkflowStatus(7, 1, 'EXPIRED', 0, 0),
];

export class StatusDataSourceMock implements StatusDataSource {
  async getWorkflowStatus(
    workflowStatusId: number
  ): Promise<WorkflowStatus | null> {
    return (
      dummyWorkflowStatuses.find(
        (ws) => ws.workflowStatusId === workflowStatusId
      ) || null
    );
  }
  async getDefaultWorkflowStatus(
    workflowId: number
  ): Promise<WorkflowStatus | null> {
    return dummyWorkflowStatuses[0];
  }
  // TODO: This needs to be implemented
  async createStatus(
    newStatusInput: Omit<Status, 'id' | 'is_default'>
  ): Promise<Status> {
    return { ...newStatusInput, id: 'DRAFT', isDefault: false };
  }
  async getStatus(statusId: string): Promise<Status | null> {
    return dummyStatuses.find((s) => s.id === statusId) as Status;
  }
  async getAllStatuses(): Promise<Status[]> {
    return dummyStatuses;
  }
  async updateStatus(status: Omit<Status, 'entityType'>): Promise<Status> {
    return { ...status, entityType: WorkflowType.PROPOSAL };
  }
  async deleteStatus(statusId: string): Promise<Status> {
    return dummyStatuses.splice(
      dummyStatuses.findIndex((s) => s.id === statusId),
      1
    )[0];
  }
  async getDefaultStatus(
    entityType: Status['entityType']
  ): Promise<Status | null> {
    return dummyStatuses[0];
  }
}

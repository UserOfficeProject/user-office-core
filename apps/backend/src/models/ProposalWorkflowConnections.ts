import { ProposalStatus, Status } from './ProposalStatus';

export type NextAndPreviousProposalStatuses = {
  nextStatusId?: number | null;
  prevStatusId?: number | null;
  sortOrder?: number | null;
};

export class WorkflowConnection {
  constructor(
    public id: number,
    public sortOrder: number,
    public workflowId: number,
    public statusId: number,
    public status: Status,
    public nextStatusId: number | null,
    public prevStatusId: number | null,
    public droppableGroupId: string,
    public parentDroppableGroupId: string | null,
    public entityType: 'proposal' | 'experiment'
  ) {}
}

export class ProposalWorkflowConnection {
  constructor(
    public id: number,
    public sortOrder: number,
    public workflowId: number,
    public statusId: number,
    public status: ProposalStatus,
    public nextStatusId: number | null,
    public prevStatusId: number | null,
    public droppableGroupId: string,
    public parentDroppableGroupId: string | null
  ) {}
}

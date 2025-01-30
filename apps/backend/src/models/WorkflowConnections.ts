import { Status } from './Status';

export type NextAndPreviousProposalStatuses = {
  //TODO: Needs to be removed
  nextStatusId?: number | null;
  prevStatusId?: number | null;
  sortOrder?: number | null;
};

export type NextAndPreviousStatuses = {
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
    public nextStatusId: number | null,
    public prevStatusId: number | null,
    public droppableGroupId: string,
    public parentDroppableGroupId: string | null
  ) {}
}

export class WorkflowConnectionWithStatus {
  //TODO: This needs to be added in the appropriate place and tested
  constructor(
    public id: number,
    public sortOrder: number,
    public workflowId: number,
    public statusId: number,
    public status: Status,
    public nextStatusId: number | null,
    public prevStatusId: number | null,
    public droppableGroupId: string,
    public parentDroppableGroupId: string | null
  ) {}
}

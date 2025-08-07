import { Status } from './Status';

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
    public posX: number,
    public posY: number,
    public prevConnectionId: number | null
  ) {}
}

export class WorkflowConnectionWithStatus {
  constructor(
    public id: number,
    public sortOrder: number,
    public workflowId: number,
    public statusId: number,
    public status: Status,
    public nextStatusId: number | null,
    public prevStatusId: number | null,
    public posX: number,
    public posY: number,
    public prevConnectionId: number | null
  ) {}
}

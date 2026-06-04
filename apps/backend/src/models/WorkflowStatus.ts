export class WorkflowStatus {
  constructor(
    public workflowStatusId: number,
    public workflowId: number,
    public statusId: string,
    public posX: number,
    public posY: number
  ) {}
}

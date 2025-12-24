export class WorkflowConnection {
  constructor(
    public id: number,
    public workflowId: number,
    public prevWorkflowStatusId: number,
    public nextWorkflowStatusId: number
  ) {}
}

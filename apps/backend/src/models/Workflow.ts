export enum WorkflowType {
  PROPOSAL = 'PROPOSAL',
  EXPERIMENT = 'EXPERIMENT',
}

export class Workflow {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public entityType: WorkflowType,
    public connectionLineType: string
  ) {}
}

export class WorkflowStatus {
  constructor(
    public id: number,
    public workflowId: number,
    public statusId: number,
    public posX: number,
    public posY: number
  ) {}
}

export class WorkflowConnection {
  constructor(
    public id: number,
    public workflowId: number,
    public prevWorkflowStatusId: number,
    public nextWorkflowStatusId: number
  ) {}
}

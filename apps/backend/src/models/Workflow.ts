export enum WorkflowType {
  PROPOSAL = 'PROPOSAL',
  EXPERIMENT = 'EXPERIMENT',
}

export class Workflow {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public entityType: WorkflowType
  ) {}
}

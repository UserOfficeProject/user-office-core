export enum WorkflowType {
  PROPOSAL = 'proposal',
  EXPERIMENT = 'experiment',
}

export class Workflow {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public entityType: WorkflowType
  ) {}
}

export class Workflow {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public entityType: 'proposal' | 'experiment'
  ) {}
}
export class ProposalWorkflow extends Workflow {
  constructor(
    public id: number,
    public name: string,
    public description: string
  ) {
    super(id, name, description, 'proposal');
  }
}

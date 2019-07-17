export class Proposal {
  constructor(
    public id: number,
    public title: string,
    public abstract: string,
    public proposer: number,
    public status: number,
    public created: string,
    public updated: string
  ) {}

  users(args: any, context: any) {
    return context.queries.user.dataSource.getProposalUsers(this.id);
  }
}

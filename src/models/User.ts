export class User {
  constructor(
    public id: number,
    public title: string,
    public firstname: string,
    public lastname: string,
    public username: string,
    public created: string,
    public updated: string
  ) {}

  roles(args: any, context: any) {
    return context.queries.user.dataSource.getUserRoles(this.id);
  }

  proposals(args: any, context: any) {
    return context.queries.proposal.dataSource.getUserProposals(this.id);
  }
}

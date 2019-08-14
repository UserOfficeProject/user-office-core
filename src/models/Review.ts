export class Review {
  constructor(
    public id: number,
    public proposalID: number,
    public userID: number,
    public comment: string,
    public grade: number,
    public status: number
  ) {}

  reviewer(args: any, context: any) {
    return context.queries.user.dataSource.get(this.userID);
  }

  proposal(args: any, context: any) {
    return context.queries.proposal.dataSource.get(this.proposalID);
  }
}

export class Proposal {
  id: number;
  title: string;
  abstract: string;
  status: number;

  constructor(id: number, title: string, abstract: string, status: number) {
    this.id = id;
    this.title = title;
    this.abstract = abstract;
    this.status = status;
  }

  users(args: any, context: any) {
    return context.queries.user.dataSource.getProposalUsers(this.id);
  }
}

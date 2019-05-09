export default class Proposal {
  id: number;
  abstract: string;
  status: number;

  constructor(id: number, abstract: string, status: number) {
    this.id = id;
    this.abstract = abstract;
    this.status = status;
  }

  users(args: any, context: any) {
    return context.repository.user.getProposalUsers(this.id);
  }
}

export default class User {
  id: number;
  firstname: string;
  lastname: string;
  username: string;

  constructor(
    id: number,
    firstname: string,
    lastname: string,
    username: string
  ) {
    this.id = id;
    this.firstname = firstname;
    this.lastname = lastname;
    this.username = username;
  }

  roles(args: any, context: any) {
    return context.queries.user.dataSource.getUserRoles(this.id);
  }

  proposals(args: any, context: any) {
    return context.queries.proposal.dataSource.getUserProposals(this.id);
  }
}

export default class User {
  id: number;
  firstname: string;
  lastname: string;

  constructor(id: number, firstname: string, lastname: string) {
    this.id = id;
    this.firstname = firstname;
    this.lastname = lastname;
  }

  roles(args: any, context: any) {
    return context.queries.user.dataSource.getUserRoles(this.id);
  }
}

export default class User {
  id: number;
  firstname: string;
  lastname: string;
  roles: string[];

  constructor(
    id: number,
    firstname: string,
    lastname: string,
    roles: string[] = []
  ) {
    this.id = id;
    this.firstname = firstname;
    this.lastname = lastname;
    this.roles = roles;
  }
}

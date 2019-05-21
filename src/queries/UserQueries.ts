import UserDataSource from "../datasources/UserDataSource";

export default class UserQueries {
  constructor(private dataSource: UserDataSource) {}

  get(id: number) {
    return this.dataSource.get(id);
  }

  getAll() {
    return this.dataSource.getUsers();
  }
}

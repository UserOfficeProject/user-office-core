import { UserDataSource } from "../datasources/UserDataSource";
import User from "../models/User";
import { isUserOfficer, isUser } from "../utils/userAuthorization";

export default class UserQueries {
  constructor(private dataSource: UserDataSource) {}

  async get(id: number, agent: User | null) {
    if (isUserOfficer(agent) || isUser(agent, id)) {
      return this.dataSource.get(id);
    } else {
      return null;
    }
  }

  async getAll(agent: User | null) {
    if (isUserOfficer(agent)) {
      return this.dataSource.getUsers();
    } else {
      return null;
    }
  }

  async getRoles() {
    return this.dataSource.getRoles();
  }
}

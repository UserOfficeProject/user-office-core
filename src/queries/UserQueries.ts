import { UserDataSource } from "../datasources/UserDataSource";
import { User } from "../models/User";

export default class UserQueries {
  constructor(private dataSource: UserDataSource, private userAuth: any) {}

  async getAgent(id: number) {
    return this.dataSource.get(id);
  }

  async get(id: number, agent: User | null) {
    if (
      (await this.userAuth.isUserOfficer(agent)) ||
      (await this.userAuth.isUser(agent, id))
    ) {
      return this.dataSource.get(id);
    } else {
      return null;
    }
  }

  async getAll(agent: User | null, filter: string) {
    console.log(filter);
    if (agent == null) {
      return null;
    }
    return this.dataSource.getUsers(filter);
  }

  async getRoles(agent: User | null) {
    if (await this.userAuth.isUserOfficer(agent)) {
      return this.dataSource.getRoles();
    } else {
      return null;
    }
  }
}

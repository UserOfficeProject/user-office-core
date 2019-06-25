import User from "../models/User";
import { UserDataSource } from "../datasources/UserDataSource";
import { rejection, Rejection } from "../rejection";
import { isUserOfficer } from "../utils/userAuthorization";

export default class UserMutations {
  constructor(private dataSource: UserDataSource) {}

  async create(firstname: string, lastname: string): Promise<User | Rejection> {
    if (firstname === "") {
      return rejection("INVALID_FIRST_NAME");
    }

    if (lastname === "") {
      return rejection("INVALID_LAST_NAME");
    }

    const result = await this.dataSource.create(firstname, lastname);
    return result || rejection("INTERNAL_ERROR");
  }

  async addRole(
    agent: User | null,
    userID: number,
    roleID: number
  ): Promise<Boolean | Rejection> {
    const result = await this.dataSource.addUserRole(userID, roleID);

    return result || rejection("INTERNAL_ERROR");
  }
}

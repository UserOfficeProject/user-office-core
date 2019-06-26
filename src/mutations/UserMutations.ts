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

  async update(
    agent: User | null,
    id: string,
    firstname: string,
    lastname: string,
    roles: number[]
  ): Promise<User | Rejection> {
    // Get user information
    let user = await this.dataSource.get(parseInt(id)); //Hacky
    console.log(user);
    // Check that proposal exist
    if (!user) {
      return rejection("INTERNAL_ERROR");
    }

    if (firstname !== undefined) {
      user.firstname = firstname;

      if (firstname.length < 2) {
        return rejection("TOO_SHORT_NAME");
      }
    }

    if (lastname !== undefined) {
      user.lastname = lastname;

      if (lastname.length < 2) {
        return rejection("TOO_SHORT_NAME");
      }
    }

    const result = await this.dataSource.update(user);

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

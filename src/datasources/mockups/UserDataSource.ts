import { UserDataSource } from "../UserDataSource";
import User from "../../models/User";

export const dummyUserOfficer = new User(4, "John", "Doe", ["User_Officer"]);
export const dummyUser = new User(5, "Jane", "Doe", ["User"]);

export class userDataSource implements UserDataSource {
  async get(id: number) {
    return dummyUser;
  }

  async getUsers() {
    return [dummyUser, dummyUserOfficer];
  }

  async getProposalUsers() {
    return [dummyUser, dummyUserOfficer];
  }

  async create(firstname: string, lastname: string) {
    return dummyUser;
  }
}

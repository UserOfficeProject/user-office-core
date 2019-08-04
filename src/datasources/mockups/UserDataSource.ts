import { UserDataSource } from "../UserDataSource";
import { User } from "../../models/User";
import { Role } from "../../models/Role";

export const dummyUserOfficer = new User(
  4,
  "Mr.",
  "John",
  "Doe",
  "JoDo",
  "2019-07-17 08:25:12.23043+00",
  "2019-07-17 08:25:12.23043+00"
);
export const dummyUser = new User(
  2,
  "",
  "Jane",
  "Doe",
  "JaDa",
  "2019-07-17 08:25:12.23043+00",
  "2019-07-17 08:25:12.23043+00"
);

export const dummyUserNotOnProposal = new User(
  3,
  "Dr.",
  "Noel",
  "Doe",
  "NoDO",
  "2019-07-17 08:25:12.23043+00",
  "2019-07-17 08:25:12.23043+00"
);

export class userDataSource implements UserDataSource {
  async getByUsername(username: string): Promise<User | null> {
    return dummyUser;
  }
  async getPasswordByUsername(username: string): Promise<string | null> {
    return "Test1234!";
  }
  async setUserRoles(id: number, roles: number[]): Promise<Boolean | null> {
    return true;
  }
  async getUserRoles(id: number): Promise<Role[]> {
    if (id == dummyUserOfficer.id) {
      return [{ id: 1, shortCode: "user_officer", title: "User Officer" }];
    } else {
      return [{ id: 2, shortCode: "user", title: "User" }];
    }
  }
  async getRoles(): Promise<Role[]> {
    return [
      { id: 1, shortCode: "user_officer", title: "User Officer" },
      { id: 2, shortCode: "user", title: "User" }
    ];
  }
  async update(user: User): Promise<User | null> {
    return dummyUser;
  }

  async get(id: number) {
    return dummyUser;
  }

  async getUsers(filter: string) {
    return [dummyUser, dummyUserOfficer];
  }

  async getProposalUsers(id: number) {
    return [dummyUser];
  }

  async create(firstname: string, lastname: string) {
    return dummyUser;
  }
}

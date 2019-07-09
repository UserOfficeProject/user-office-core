import { UserDataSource } from "../UserDataSource";
import { User } from "../../models/User";
import { Role } from "../../models/Role";

export const dummyUserOfficer = new User(4, "John", "Doe", "JoDo");
export const dummyUser = new User(5, "Jane", "Doe", "JaDa");

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
    if (id == 4) {
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
  async addUserRole(userID: number, roleID: number): Promise<Boolean | null> {
    return true;
  }
  async get(id: number) {
    return dummyUser;
  }

  async getUsers(filter: string) {
    return [dummyUser, dummyUserOfficer];
  }

  async getProposalUsers() {
    return [dummyUser, dummyUserOfficer];
  }

  async create(firstname: string, lastname: string) {
    return dummyUser;
  }
}

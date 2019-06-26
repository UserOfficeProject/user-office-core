import { UserDataSource } from "../UserDataSource";
import User from "../../models/User";
import Role from "../../models/Role";

export const dummyUserOfficer = new User(4, "John", "Doe", "JoDo");
export const dummyUser = new User(5, "Jane", "Doe", "JaDa");

export class userDataSource implements UserDataSource {
  getByUsername(username: string): Promise<User | null> {
    throw new Error("Method not implemented.");
  }
  async getPasswordByUsername(username: string): Promise<String | null> {
    return "Test1234!";
  }
  setUserRoles(id: number, roles: number[]): Promise<Boolean | null> {
    throw new Error("Method not implemented.");
  }
  async getUserRoles(id: number): Promise<Role[]> {
    throw new Error("Method not implemented.");
  }
  async getRoles(): Promise<Role[]> {
    throw new Error("Method not implemented.");
  }
  async update(user: User): Promise<User | null> {
    throw new Error("Method not implemented.");
  }
  addUserRole(userID: number, roleID: number): boolean {
    throw new Error("Method not implemented.");
  }
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

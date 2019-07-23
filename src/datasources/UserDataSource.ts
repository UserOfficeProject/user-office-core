import { User } from "../models/User";
import { Role } from "../models/Role";

export interface UserDataSource {
  // Read
  get(id: number): Promise<User | null>;
  getByUsername(username: string): Promise<User | null>;
  getUserRoles(id: number): Promise<Role[]>;
  getUsers(filter?: string, first?: number, offset?: number): Promise<User[]>;
  getRoles(): Promise<Role[]>;
  getProposalUsers(proposalId: number): Promise<User[]>;
  // Write
  create(
    firstname: string,
    lastname: string,
    username: string,
    password: string
  ): Promise<User | null>;
  update(user: User): Promise<User | null>;
  addUserRole(userID: number, roleID: number): Promise<Boolean | null>;
  setUserRoles(id: number, roles: number[]): Promise<Boolean | null>;
  getPasswordByUsername(username: string): Promise<string | null>;
}

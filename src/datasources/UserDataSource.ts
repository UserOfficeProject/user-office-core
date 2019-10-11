import { User } from "../models/User";
import { Role } from "../models/Role";
import { Review } from "../models/Review";

export interface UserDataSource {
  // Read
  get(id: number): Promise<User | null>;
  getByUsername(username: string): Promise<User | null>;
  getByEmail(email: String): Promise<User | null>;
  getUserRoles(id: number): Promise<Role[]>;
  getUsers(
    filter?: string,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; users: User[] }>;
  getRoles(): Promise<Role[]>;
  getProposalUsers(proposalId: number): Promise<User[]>;
  // Write
  create(
    user_title: string,
    firstname: string,
    middlename: string,
    lastname: string,
    username: string,
    password: string,
    preferredname: string,
    orcid: string,
    gender: string,
    nationality: string,
    birthdate: string,
    organisation: string,
    department: string,
    organisation_address: string,
    position: string,
    email: string,
    telephone: string,
    telephone_alt: string
  ): Promise<User | null>;
  update(user: User): Promise<User | null>;
  setUserRoles(id: number, roles: number[]): Promise<Boolean | null>;
  setUserPassword(id: number, password: string): Promise<Boolean>;
  getPasswordByUsername(username: string): Promise<string | null>;
  setUserEmailVerified(id: number): Promise<Boolean>;
}

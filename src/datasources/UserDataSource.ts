import { User, BasicUserDetails } from "../models/User";
import { Role } from "../models/Role";

export interface UserDataSource {
  getBasicUserInfo(id: number): Promise<BasicUserDetails | null>;
  checkEmailExist(email: string): Promise<Boolean | null>;
  checkOrcIDExist(orcID: string): Promise<Boolean | null>;
  // Read
  get(id: number): Promise<User | null>;
  getByUsername(username: string): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
  getPasswordByEmail(email: string): Promise<string | null>;
  getUserRoles(id: number): Promise<Role[]>;
  getUsers(
    filter?: string,
    first?: number,
    offset?: number,
    usersOnly?: boolean,
    subtractUsers?: [number]
  ): Promise<{ totalCount: number; users: BasicUserDetails[] }>;
  getRoles(): Promise<Role[]>;
  getProposalUsers(proposalId: number): Promise<BasicUserDetails[]>;
  getProposalUsersFull(proposalId: number): Promise<User[]>;
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
    orcidRefreshToken: string,
    gender: string,
    nationality: number,
    birthdate: string,
    organisation: number,
    department: string,
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

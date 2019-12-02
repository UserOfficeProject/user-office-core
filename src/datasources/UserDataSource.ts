import { User, BasicUserDetails } from "../models/User";
import { Role } from "../models/Role";

export interface UserDataSource {
  createInviteUser(
    firstname: string,
    lastname: string,
    email: string
  ): Promise<number>;
  getBasicUserInfo(id: number): Promise<BasicUserDetails | null>;
  checkEmailExist(email: string): Promise<Boolean>;
  checkOrcIDExist(orcID: string): Promise<Boolean>;
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
  ): Promise<User>;
  createOrganisation(name: string, verified: boolean): Promise<number>;
  update(user: User): Promise<User>;
  setUserRoles(id: number, roles: number[]): Promise<void>;
  setUserPassword(id: number, password: string): Promise<BasicUserDetails>;
  getPasswordByUsername(username: string): Promise<string | null>;
  setUserEmailVerified(id: number): Promise<void>;
}

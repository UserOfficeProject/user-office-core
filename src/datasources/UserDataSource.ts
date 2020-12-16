/* eslint-disable @typescript-eslint/camelcase */
import { Role } from '../models/Role';
import { User, BasicUserDetails } from '../models/User';
import { AddUserRoleArgs } from '../resolvers/mutations/AddUserRoleMutation';
import { CreateUserByEmailInviteArgs } from '../resolvers/mutations/CreateUserByEmailInviteMutation';

export interface UserDataSource {
  delete(id: number): Promise<User | null>;
  addUserRole(args: AddUserRoleArgs): Promise<boolean>;
  createInviteUser(args: CreateUserByEmailInviteArgs): Promise<number>;
  getBasicUserInfo(id: number): Promise<BasicUserDetails | null>;
  checkEmailExist(email: string): Promise<boolean>;
  checkOrcIDExist(orcID: string): Promise<boolean>;
  // Read
  me(id: number): Promise<User | null>;
  get(id: number): Promise<User | null>;
  getByUsername(username: string): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
  getByOrcID(orcID: string): Promise<User | null>;
  getPasswordByEmail(email: string): Promise<string | null>;
  getUserRoles(id: number): Promise<Role[]>;
  getUsers(
    filter?: string,
    first?: number,
    offset?: number,
    userRole?: number,
    subtractUsers?: [number]
  ): Promise<{ totalCount: number; users: BasicUserDetails[] }>;
  getRoles(): Promise<Role[]>;
  getProposalUsers(proposalId: number): Promise<BasicUserDetails[]>;
  getProposalUsersFull(proposalId: number): Promise<User[]>;
  // Write
  create(
    user_title: string | undefined,
    firstname: string,
    middlename: string | undefined,
    lastname: string,
    username: string,
    password: string,
    preferredname: string | undefined,
    orcid: string,
    orcid_refreshtoken: string,
    gender: string,
    nationality: number,
    birthdate: string,
    organisation: number,
    department: string,
    position: string,
    email: string,
    telephone: string,
    telephone_alt: string | undefined
  ): Promise<User>;
  createDummyUser(userId: number): Promise<User>;
  createOrganisation(name: string, verified: boolean): Promise<number>;
  update(user: User): Promise<User>;
  setUserRoles(id: number, roles: number[]): Promise<void>;
  setUserPassword(id: number, password: string): Promise<BasicUserDetails>;
  getPasswordByUsername(username: string): Promise<string | null>;
  setUserEmailVerified(id: number): Promise<void>;
  checkScientistToProposal(
    userId: number,
    proposalId: number
  ): Promise<boolean>;
}

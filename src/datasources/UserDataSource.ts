import { Role, Roles } from '../models/Role';
import { User, BasicUserDetails, UserRole } from '../models/User';
import { AddUserRoleArgs } from '../resolvers/mutations/AddUserRoleMutation';
import { CreateUserByEmailInviteArgs } from '../resolvers/mutations/CreateUserByEmailInviteMutation';
import { UsersArgs } from '../resolvers/queries/UsersQuery';

export interface UserDataSource {
  delete(id: number): Promise<User | null>;
  addUserRole(args: AddUserRoleArgs): Promise<boolean>;
  createInviteUser(args: CreateUserByEmailInviteArgs): Promise<number>;
  getBasicUserInfo(id: number): Promise<BasicUserDetails | null>;
  getBasicUserDetailsByEmail(
    email: string,
    role?: UserRole
  ): Promise<BasicUserDetails | null>;
  checkEmailExist(email: string): Promise<boolean>;
  checkOrcIDExist(orcID: string): Promise<boolean>;
  // Read
  me(id: number): Promise<User | null>;
  getUser(id: number): Promise<User | null>;
  getByUsername(username: string): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
  getByOrcID(orcID: string): Promise<User | null>;
  getPasswordByEmail(email: string): Promise<string | null>;
  getUserRoles(id: number): Promise<Role[]>;
  getUsers(
    args: UsersArgs
  ): Promise<{ totalCount: number; users: BasicUserDetails[] }>;
  getPreviousCollaborators(
    user_id: number,
    filter?: string,
    first?: number,
    offset?: number,
    userRole?: UserRole,
    subtractUsers?: [number]
  ): Promise<{ totalCount: number; users: BasicUserDetails[] }>;
  getRoles(): Promise<Role[]>;
  getProposalUsers(proposalPk: number): Promise<BasicUserDetails[]>;
  getProposalUsersFull(proposalPk: number): Promise<User[]>;
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
    birthdate: Date,
    organisation: number,
    department: string,
    position: string,
    email: string,
    telephone: string,
    telephone_alt: string | undefined
  ): Promise<User>;
  ensureDummyUserExists(userId: number): Promise<User>;
  createOrganisation(
    name: string,
    verified: boolean,
    countryId?: number
  ): Promise<number>;
  update(user: User): Promise<User>;
  setUserRoles(id: number, roles: number[]): Promise<void>;
  setUserPassword(id: number, password: string): Promise<BasicUserDetails>;
  getPasswordByUsername(username: string): Promise<string | null>;
  setUserEmailVerified(id: number): Promise<User | null>;
  setUserNotPlaceholder(id: number): Promise<User | null>;
  checkScientistToProposal(
    userId: number,
    proposalPk: number
  ): Promise<boolean>;
  checkInstrumentManagerToProposal(
    userId: number,
    proposalPk: number
  ): Promise<boolean>;
  getRoleByShortCode(roleShortCode: Roles): Promise<Role>;
}

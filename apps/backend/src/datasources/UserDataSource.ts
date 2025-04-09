import { Country } from '../models/Country';
import { Institution } from '../models/Institution';
import { Role, Roles } from '../models/Role';
import { BasicUserDetails, User, UserRole } from '../models/User';
import { AddUserRoleArgs } from '../resolvers/mutations/AddUserRoleMutation';
import { CreateUserByEmailInviteArgs } from '../resolvers/mutations/CreateUserByEmailInviteMutation';
import { UpdateUserArgs } from '../resolvers/mutations/UpdateUserMutation';
import { UsersArgs } from '../resolvers/queries/UsersQuery';

export interface UserDataSource {
  delete(id: number): Promise<User | null>;
  addUserRole(args: AddUserRoleArgs): Promise<boolean>;
  createInviteUser(args: CreateUserByEmailInviteArgs): Promise<number>;
  getBasicUserInfo(id: number): Promise<BasicUserDetails | null>;
  getBasicUsersInfo(ids: readonly number[]): Promise<BasicUserDetails[]>;
  getBasicUserDetailsByEmail(
    email: string,
    role?: UserRole
  ): Promise<BasicUserDetails | null>;
  checkEmailExist(email: string): Promise<boolean>;
  // Read
  me(id: number): Promise<User | null>;
  getUser(id: number): Promise<User | null>;
  getUsersByUserNumbers(id: readonly number[]): Promise<User[]>;
  getUserWithInstitution(id: number): Promise<{
    user: User;
    institution: Institution;
    country: Country;
  } | null>;
  getByUsername(username: string): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
  getByOIDCSub(sub: string): Promise<User | null>;
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
  getProposalUsersWithInstitution(proposalPk: number): Promise<
    {
      user: User;
      institution: Institution;
      country: Country;
    }[]
  >;
  // Write
  create(
    user_title: string | undefined,
    firstname: string,
    middlename: string | undefined,
    lastname: string,
    username: string,
    preferredname: string | undefined,
    oidc_sub: string,
    oauth_refreshtoken: string,
    oauth_issuer: string,
    gender: string,
    nationality: number,
    birthdate: Date,
    institution: number,
    department: string,
    position: string,
    email: string,
    telephone: string,
    telephone_alt: string | undefined
  ): Promise<User>;
  ensureDummyUserExists(userId: number): Promise<User>;
  ensureDummyUsersExist(userIds: number[]): Promise<User[]>;
  createInstitution(
    name: string,
    countryId?: number,
    rorId?: string
  ): Promise<number>;
  update(user: UpdateUserArgs): Promise<User>;
  setUserRoles(id: number, roles: number[]): Promise<void>;
  setUserNotPlaceholder(id: number): Promise<User | null>;
  checkScientistToProposal(
    userId: number,
    proposalPk: number
  ): Promise<boolean>;
  checkInstrumentManagerToProposal(
    userId: number,
    proposalPk: number
  ): Promise<boolean>;
  checkTechniqueScientistToProposal(
    userId: number,
    proposalPk: number
  ): Promise<boolean>;
  getRoleByShortCode(roleShortCode: Roles): Promise<Role>;
  mergeUsers(fromUserId: number, intoUserId: number): Promise<void>;
}

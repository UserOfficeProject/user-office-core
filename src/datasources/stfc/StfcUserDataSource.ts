import { Role } from '../../models/Role';
import { Roles } from '../../models/Role';
import { BasicUserDetails, User } from '../../models/User';
import { AddUserRoleArgs } from '../../resolvers/mutations/AddUserRoleMutation';
import { CreateUserByEmailInviteArgs } from '../../resolvers/mutations/CreateUserByEmailInviteMutation';
import PostgresUserDataSource from '../postgres/UserDataSource';
import { UserDataSource } from '../UserDataSource';
import UOWSSoapClient from './UOWSSoapInterface';

const postgresUserDataSource = new PostgresUserDataSource();
const client = new UOWSSoapClient();
const token = process.env.EXTERNAL_AUTH_TOKEN;

type stfcRole = {
  name: string;
};

export interface StfcBasicPersonDetails {
  country: string;
  deptName: string;
  displayName: string;
  email: string;
  establishmentId: string;
  familyName: string;
  firstNameKnownAs: string;
  fullName: string;
  givenName: string;
  initials: string;
  orgName: string;
  title: string;
  userNumber: string;
  workPhone: string;
}

function toEssBasicUserDetails(
  stfcUser: StfcBasicPersonDetails
): BasicUserDetails {
  return new BasicUserDetails(
    Number(stfcUser.userNumber),
    stfcUser.givenName ?? '',
    stfcUser.familyName ?? '',
    stfcUser.orgName ?? '',
    '',
    new Date(),
    false
  );
}

function toEssUser(stfcUser: StfcBasicPersonDetails): User {
  return new User(
    Number(stfcUser.userNumber),
    stfcUser.title ?? '',
    stfcUser.givenName ?? '',
    undefined,
    stfcUser.familyName ?? '',
    stfcUser.email ?? '',
    stfcUser.firstNameKnownAs ?? '',
    '',
    '',
    '',
    1,
    '2000-01-01',
    1,
    stfcUser.deptName ?? '',
    '',
    stfcUser.email ?? '',
    true,
    stfcUser.workPhone ?? '',
    undefined,
    false,
    '2000-01-01 00:00:00.000000+00',
    '2000-01-01 00:00:00.000000+00'
  );
}

export class StfcUserDataSource implements UserDataSource {
  async delete(id: number): Promise<User | null> {
    throw new Error('Method not implemented.');
  }

  async addUserRole(args: AddUserRoleArgs): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  getByOrcID(orcID: string): Promise<User | null> {
    throw new Error('Method not implemented.');
  }

  async createInviteUser(args: CreateUserByEmailInviteArgs): Promise<number> {
    throw new Error('Method not implemented.');
  }

  async createOrganisation(name: string, verified: boolean): Promise<number> {
    throw new Error('Method not implemented.');
  }

  async getProposalUsersFull(proposalId: number): Promise<User[]> {
    const users: User[] = await postgresUserDataSource.getProposalUsersFull(
      proposalId
    );
    const userNumbers: string[] = users.map((user) => String(user.id));

    const stfcBasicPeople: StfcBasicPersonDetails[] | null = (
      await client.getBasicPeopleDetailsFromUserNumbers(token, userNumbers)
    )?.return;

    return stfcBasicPeople
      ? stfcBasicPeople.map((person) => toEssUser(person))
      : Promise.resolve([]);
  }

  async getBasicUserInfo(id: number): Promise<BasicUserDetails | null> {
    const stfcUser = (
      await client.getBasicPersonDetailsFromUserNumber(token, id)
    )?.return;

    return stfcUser ? toEssBasicUserDetails(stfcUser) : null;
  }

  async checkOrcIDExist(orcID: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async checkEmailExist(email: string): Promise<boolean> {
    return (await client.getBasicPersonDetailsFromEmail(token, email)) != null;
  }

  async getPasswordByEmail(email: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  setUserEmailVerified(id: number): Promise<User | null> {
    throw new Error('Method not implemented.');
  }

  async setUserNotPlaceholder(id: number): Promise<User | null> {
    return await postgresUserDataSource.setUserNotPlaceholder(id);
  }

  async setUserPassword(
    id: number,
    password: string
  ): Promise<BasicUserDetails> {
    throw new Error('Method not implemented.');
  }

  async getByEmail(email: string): Promise<User | null> {
    const stfcUser = (await client.getBasicPersonDetailsFromEmail(token, email))
      ?.return;

    return stfcUser ? toEssUser(stfcUser) : null;
  }

  async getByUsername(username: string): Promise<User | null> {
    const stfcUser = (
      await client.getBasicPersonDetailsFromUserNumber(token, username)
    )?.return;

    return stfcUser ? toEssUser(stfcUser) : null;
  }

  async getPasswordByUsername(username: string): Promise<string | null> {
    throw new Error('Method not implemented.');
  }

  async setUserRoles(id: number, roles: number[]): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async getUserRoles(id: number): Promise<Role[]> {
    const stfcRoles: stfcRole[] | null = (
      await client.getRolesForUser(token, id)
    )?.return;

    const roleDefinitions: Role[] = await this.getRoles();
    const userRole: Role | undefined = roleDefinitions.find(
      (role) => role.shortCode == Roles.USER
    );
    if (!userRole) {
      return Promise.resolve([]);
    }

    if (!stfcRoles || stfcRoles.length == 0) {
      return [userRole];
    }

    const stfcRolesToEssRoleDefinitions = new Map<string, Roles>([
      ['User Officer', Roles.USER_OFFICER],
      ['ISIS Instrument Scientist', Roles.INSTRUMENT_SCIENTIST],
    ]);

    const roles: Role[] = [];

    // The User role must be the first item
    roles.push(userRole);

    stfcRoles.forEach((stfcRole: stfcRole) => {
      const essRoleDefinition:
        | Roles
        | undefined = stfcRolesToEssRoleDefinitions.get(stfcRole.name);
      if (essRoleDefinition) {
        const essRole: Role | undefined = roleDefinitions.find(
          (role) => role.shortCode == essRoleDefinition
        );

        if (essRole && !roles.includes(essRole)) {
          essRole.title = stfcRole.name;
          roles.push(essRole);
        }
      }
    });

    return roles;
  }

  async getRoles(): Promise<Role[]> {
    return await postgresUserDataSource.getRoles();
  }

  async update(user: User): Promise<User> {
    throw new Error('Method not implemented.');
  }

  async me(id: number) {
    const stfcUser = (
      await client.getBasicPersonDetailsFromUserNumber(token, id)
    )?.return;

    return stfcUser ? toEssUser(stfcUser) : null;
  }

  async getUser(id: number) {
    const stfcUser = (
      await client.getBasicPersonDetailsFromUserNumber(token, id)
    )?.return;

    return stfcUser ? toEssUser(stfcUser) : null;
  }

  async ensureDummyUserExists(userId: number): Promise<User> {
    return await postgresUserDataSource.ensureDummyUserExists(userId);
  }

  async getUsers(
    filter?: string,
    first?: number,
    offset?: number,
    userRole?: number,
    subtractUsers?: [number]
  ): Promise<{ totalCount: number; users: BasicUserDetails[] }> {
    const dbUsers: BasicUserDetails[] = (
      await postgresUserDataSource.getUsers(
        filter,
        first,
        offset,
        userRole,
        subtractUsers
      )
    ).users;

    let users: BasicUserDetails[] = [];

    if (dbUsers[0]) {
      const userNumbers: string[] = dbUsers.map((record) => String(record.id));
      const stfcBasicPeople: StfcBasicPersonDetails[] | null = (
        await client.getBasicPeopleDetailsFromUserNumbers(token, userNumbers)
      )?.return;

      users = stfcBasicPeople
        ? stfcBasicPeople.map((person) => toEssBasicUserDetails(person))
        : [];
    }

    return {
      totalCount: users.length,
      users,
    };
  }

  async getPreviousCollaborators(
    userId: number,
    filter?: string,
    first?: number,
    offset?: number,
    userRole?: number,
    subtractUsers?: [number]
  ): Promise<{ totalCount: number; users: BasicUserDetails[] }> {
    if (userId == -1) {
      return this.getUsers(filter, first, offset, userRole, subtractUsers);
    }
    const dbUsers: BasicUserDetails[] = (
      await this.getPreviousCollaborators(
        userId,
        filter,
        first,
        offset,
        userRole,
        subtractUsers
      )
    ).users;

    let users: BasicUserDetails[] = [];

    if (dbUsers[0]) {
      const userNumbers: string[] = dbUsers.map((record) => String(record.id));
      const stfcBasicPeople: StfcBasicPersonDetails[] | null = (
        await client.getBasicPeopleDetailsFromUserNumbers(token, userNumbers)
      )?.return;

      users = stfcBasicPeople
        ? stfcBasicPeople.map((person) => toEssBasicUserDetails(person))
        : [];
    }

    return {
      totalCount: users.length,
      users,
    };
  }

  async getProposalUsers(proposalId: number): Promise<BasicUserDetails[]> {
    const users: BasicUserDetails[] = await postgresUserDataSource.getProposalUsers(
      proposalId
    );
    const userNumbers: string[] = users.map((user) => String(user.id));

    const stfcBasicPeople: StfcBasicPersonDetails[] | null = (
      await client.getBasicPeopleDetailsFromUserNumbers(token, userNumbers)
    )?.return;

    return stfcBasicPeople
      ? stfcBasicPeople.map((person) => toEssBasicUserDetails(person))
      : Promise.resolve([]);
  }

  async checkScientistToProposal(
    scientistId: number,
    proposalId: number
  ): Promise<boolean> {
    return await postgresUserDataSource.checkScientistToProposal(
      scientistId,
      proposalId
    );
  }

  async create(
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
  ): Promise<User> {
    throw new Error('Method not implemented.');
  }
}

import { Role } from '../../models/Role';
import { Roles } from '../../models/Role';
import { BasicUserDetails, User } from '../../models/User';
import { AddUserRoleArgs } from '../../resolvers/mutations/AddUserRoleMutation';
import { CreateUserByEmailInviteArgs } from '../../resolvers/mutations/CreateUserByEmailInviteMutation';
import { UsersArgs } from '../../resolvers/queries/UsersQuery';
import PostgresUserDataSource from '../postgres/UserDataSource';
import { UserDataSource } from '../UserDataSource';
import UOWSSoapClient from './UOWSSoapInterface';

const postgresUserDataSource = new PostgresUserDataSource();
const client = new UOWSSoapClient(process.env.EXTERNAL_AUTH_SERVICE_URL);
const token = process.env.EXTERNAL_AUTH_TOKEN;

type StfcRolesToEssRole = { [key: string]: Roles[] };

/*
 * Must not contain user role, this is appended at the very last step.
 */
const stfcRolesToEssRoleDefinitions: StfcRolesToEssRole = {
  'User Officer': [Roles.USER_OFFICER, Roles.INSTRUMENT_SCIENTIST],
  'ISIS Instrument Scientist': [Roles.INSTRUMENT_SCIENTIST],
  'CLF Artemis FAP Secretary': [Roles.USER_OFFICER, Roles.INSTRUMENT_SCIENTIST],
  'CLF Artemis Link Scientist': [Roles.INSTRUMENT_SCIENTIST],
  'CLF HPL FAP Secretary': [Roles.USER_OFFICER, Roles.INSTRUMENT_SCIENTIST],
  'CLF HPL Link Scientist': [Roles.INSTRUMENT_SCIENTIST],
  'CLF LSF FAP Secretary': [Roles.USER_OFFICER, Roles.INSTRUMENT_SCIENTIST],
  'CLF LSF Link Scientist': [Roles.INSTRUMENT_SCIENTIST],
};

export type stfcRole = {
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
    stfcUser.displayName ?? '',
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
    new Date('2000-01-01'),
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

  async getProposalUsersFull(proposalPk: number): Promise<User[]> {
    const users: User[] = await postgresUserDataSource.getProposalUsersFull(
      proposalPk
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
    if (stfcUser != null) {
      this.ensureDummyUserExists(stfcUser.userNumber);
    }

    return stfcUser ? toEssBasicUserDetails(stfcUser) : null;
  }

  async getBasicUserDetailsByEmail(
    email: string
  ): Promise<BasicUserDetails | null> {
    const stfcUser = (
      await client.getSearchableBasicPersonDetailsFromEmail(token, email)
    )?.return;
    if (stfcUser != null) {
      this.ensureDummyUserExists(stfcUser.userNumber);
    }

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
    if (stfcUser != null) {
      this.ensureDummyUserExists(stfcUser.userNumber);
    }

    return stfcUser ? toEssUser(stfcUser) : null;
  }

  async getByUsername(username: string): Promise<User | null> {
    const stfcUser = (
      await client.getBasicPersonDetailsFromUserNumber(token, username)
    )?.return;
    if (stfcUser != null) {
      this.ensureDummyUserExists(stfcUser.userNumber);
    }

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

    /*
     * Convert the STFC roles to the Roles enums which refers to roles
     * by short code. We will use the short code to filter relevant
     * roles.
     */
    const userRolesAsEnum: Roles[] = stfcRoles
      .flatMap((stfcRole) => stfcRolesToEssRoleDefinitions[stfcRole.name])
      .filter((r) => r !== undefined) as Roles[];

    /*
     * Filter relevant roles by short code.
     */
    const userRolesAsRole: Role[] = userRolesAsEnum
      .map((r) => roleDefinitions.find((d) => d.shortCode === r))
      .filter((r) => r !== undefined) as Role[];

    /*
     * We can't return non-unique roles.
     */
    const uniqueRoles: Role[] = [...new Set(userRolesAsRole)];

    uniqueRoles.sort((a, b) => a.id - b.id);

    /*
     * Prepend the user role as it must be first.
     */
    return [userRole, ...uniqueRoles];
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
    if (stfcUser != null) {
      await this.ensureDummyUserExists(stfcUser.userNumber);
    }

    return stfcUser ? toEssUser(stfcUser) : null;
  }

  async ensureDummyUserExists(userId: number): Promise<User> {
    return await postgresUserDataSource.ensureDummyUserExists(userId);
  }

  async getUsers({
    filter,
    first,
    offset,
    subtractUsers,
  }: UsersArgs): Promise<{ totalCount: number; users: BasicUserDetails[] }> {
    let userDetails: BasicUserDetails[] = [];
    let finalTotalCount = 0;

    if (filter) {
      userDetails = [];

      const stfcBasicPeopleByLastName: StfcBasicPersonDetails[] = (
        await client.getBasicPeopleDetailsFromSurname(token, filter, true)
      )?.return;

      userDetails = stfcBasicPeopleByLastName.map((person) =>
        toEssBasicUserDetails(person)
      );

      finalTotalCount = userDetails.length;
    } else {
      const { users, totalCount } = await postgresUserDataSource.getUsers({
        filter: undefined,
        first: first,
        offset: offset,
        userRole: undefined,
        subtractUsers: subtractUsers,
        orderDirection: 'asc',
      });

      finalTotalCount = totalCount;

      if (users[0]) {
        const userNumbers: string[] = users.map((record) => String(record.id));
        const stfcBasicPeople: StfcBasicPersonDetails[] | null = (
          await client.getBasicPeopleDetailsFromUserNumbers(token, userNumbers)
        )?.return;

        userDetails = stfcBasicPeople
          ? stfcBasicPeople.map((person) => toEssBasicUserDetails(person))
          : [];
      }
    }

    return {
      users: userDetails.sort((a, b) => a.id - b.id),
      totalCount: finalTotalCount,
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
    const dbUsers: BasicUserDetails[] = (
      await postgresUserDataSource.getPreviousCollaborators(
        userId,
        filter,
        first,
        offset,
        undefined,
        subtractUsers
      )
    ).users;

    let users: BasicUserDetails[] = [];

    if (dbUsers[0]) {
      const userNumbers: string[] = dbUsers.map((record) => String(record.id));
      const stfcBasicPeople: StfcBasicPersonDetails[] | null = (
        await client.getSearchableBasicPeopleDetailsFromUserNumbers(
          token,
          userNumbers
        )
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

  async getProposalUsers(proposalPk: number): Promise<BasicUserDetails[]> {
    const users: BasicUserDetails[] =
      await postgresUserDataSource.getProposalUsers(proposalPk);
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
    proposalPk: number
  ): Promise<boolean> {
    return await postgresUserDataSource.checkScientistToProposal(
      scientistId,
      proposalPk
    );
  }

  async checkInstrumentManagerToProposal(
    scientistId: number,
    proposalPk: number
  ): Promise<boolean> {
    return await postgresUserDataSource.checkInstrumentManagerToProposal(
      scientistId,
      proposalPk
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
    birthdate: Date,
    organisation: number,
    department: string,
    position: string,
    email: string,
    telephone: string,
    telephone_alt: string | undefined
  ): Promise<User> {
    throw new Error('Method not implemented.');
  }

  async getRoleByShortCode(roleShortCode: Roles): Promise<Role> {
    throw new Error('Method not implemented.');
  }
}

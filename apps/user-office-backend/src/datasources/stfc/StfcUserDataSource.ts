import { Role } from '../../models/Role';
import { Roles } from '../../models/Role';
import { BasicUserDetails, User } from '../../models/User';
import { AddUserRoleArgs } from '../../resolvers/mutations/AddUserRoleMutation';
import { CreateUserByEmailInviteArgs } from '../../resolvers/mutations/CreateUserByEmailInviteMutation';
import { UsersArgs } from '../../resolvers/queries/UsersQuery';
import { LRUCache } from '../../utils/LRUCache';
import PostgresUserDataSource from '../postgres/UserDataSource';
import { UserDataSource } from '../UserDataSource';
import UOWSSoapClient from './UOWSSoapInterface';

const postgresUserDataSource = new PostgresUserDataSource();
const client = UOWSSoapClient.getInstance();
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
  orgId: number;
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
    stfcUser.orgId ?? 1,
    '',
    new Date(),
    false,
    ''
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
  private static readonly userDetailsCacheMaxElements = 200;
  private static readonly userDetailsCacheSecondsToLive = 600; // 10 minutes
  private static readonly rolesCacheMaxElements = 200;
  private static readonly rolesCacheSecondsToLive = 300; //5 minutes

  private uowsBasicUserDetailsCache = new LRUCache<StfcBasicPersonDetails>(
    StfcUserDataSource.userDetailsCacheMaxElements,
    StfcUserDataSource.userDetailsCacheSecondsToLive
  ).enableStatsLogging('uowsBasicUserDetailsCache');

  private uowsSearchableBasicUserDetailsCache =
    new LRUCache<StfcBasicPersonDetails>(
      StfcUserDataSource.userDetailsCacheMaxElements,
      StfcUserDataSource.userDetailsCacheSecondsToLive
    ).enableStatsLogging('uowsSearchableBasicUserDetailsCache');

  private uowsRolesCache = new LRUCache<Role[]>(
    StfcUserDataSource.rolesCacheMaxElements,
    StfcUserDataSource.rolesCacheSecondsToLive
  ).enableStatsLogging('uowsRolesCache');

  private async getStfcBasicPersonByUserNumber(
    userNumber: string,
    searchableOnly?: boolean
  ): Promise<StfcBasicPersonDetails | null> {
    return this.getStfcBasicPeopleByUserNumbers(
      [userNumber],
      searchableOnly
    ).then((stfcUsers) => (stfcUsers.length > 0 ? stfcUsers[0] : null));
  }

  private async getStfcBasicPeopleByUserNumbers(
    userNumbers: string[],
    searchableOnly?: boolean
  ): Promise<StfcBasicPersonDetails[]> {
    const cache = searchableOnly
      ? this.uowsSearchableBasicUserDetailsCache
      : this.uowsBasicUserDetailsCache;

    const stfcUsers: StfcBasicPersonDetails[] = [];
    const cacheMisses: string[] = [];

    for (const userNumber of userNumbers) {
      const cachedUser = cache.get(userNumber);
      if (cachedUser) {
        stfcUsers.push(cachedUser);
      } else {
        cacheMisses.push(userNumber);
      }
    }

    if (cacheMisses.length > 0) {
      const uowsRequest = searchableOnly
        ? client.getSearchableBasicPeopleDetailsFromUserNumbers(
            token,
            userNumbers
          )
        : client.getBasicPeopleDetailsFromUserNumbers(token, userNumbers);
      const usersFromUows: StfcBasicPersonDetails[] | null = (await uowsRequest)
        ?.return;

      if (usersFromUows) {
        await this.ensureDummyUsersExist(
          usersFromUows.map((stfcUser) => parseInt(stfcUser.userNumber))
        );
        usersFromUows.map((user) => cache.put(user.userNumber, user));
        stfcUsers.push(...usersFromUows);
      }
    }

    return stfcUsers;
  }

  private async getStfcBasicPersonByEmail(
    email: string,
    searchableOnly?: boolean
  ): Promise<StfcBasicPersonDetails | null> {
    const cache = searchableOnly
      ? this.uowsSearchableBasicUserDetailsCache
      : this.uowsBasicUserDetailsCache;

    const cachedUser = cache.get(email);
    if (cachedUser) {
      return cachedUser;
    }

    const uowsRequest = searchableOnly
      ? client.getSearchableBasicPersonDetailsFromEmail(token, email)
      : client.getBasicPersonDetailsFromEmail(token, email);
    const stfcUser: StfcBasicPersonDetails | null = (await uowsRequest)?.return;

    if (!stfcUser) {
      return null;
    }

    await this.ensureDummyUserExists(parseInt(stfcUser.userNumber));
    cache.put(email, stfcUser);

    return stfcUser;
  }

  async delete(id: number): Promise<User | null> {
    throw new Error('Method not implemented.');
  }

  async addUserRole(args: AddUserRoleArgs): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  getByOIDCSub(oidcSub: string): Promise<User | null> {
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

    return this.getStfcBasicPeopleByUserNumbers(userNumbers).then((stfcUsers) =>
      stfcUsers.map((person) => toEssUser(person))
    );
  }

  async getBasicUserInfo(id: number): Promise<BasicUserDetails | null> {
    return this.getStfcBasicPersonByUserNumber(String(id)).then(
      (stfcBasicPerson) =>
        stfcBasicPerson ? toEssBasicUserDetails(stfcBasicPerson) : null
    );
  }

  async getBasicUserDetailsByEmail(
    email: string
  ): Promise<BasicUserDetails | null> {
    return this.getStfcBasicPersonByEmail(email, true).then((stfcUser) =>
      stfcUser ? toEssBasicUserDetails(stfcUser) : null
    );
  }

  async checkEmailExist(email: string): Promise<boolean> {
    return this.getStfcBasicPersonByEmail(email).then((user) => !!user);
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
    return this.getStfcBasicPersonByEmail(email).then((stfcUser) =>
      stfcUser ? toEssUser(stfcUser) : null
    );
  }

  async getByUsername(username: string): Promise<User | null> {
    // We use user numbers as usernames
    return this.getUser(parseInt(username));
  }

  async getPasswordByUsername(username: string): Promise<string | null> {
    throw new Error('Method not implemented.');
  }

  async setUserRoles(id: number, roles: number[]): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async getUserRoles(id: number): Promise<Role[]> {
    const cachedRoles = this.uowsRolesCache.get(String(id));
    if (cachedRoles) {
      return cachedRoles;
    }

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
    const userRoles = [userRole, ...uniqueRoles];

    this.uowsRolesCache.put(String(id), userRoles);

    return userRoles;
  }

  async getRoles(): Promise<Role[]> {
    return await postgresUserDataSource.getRoles();
  }

  async update(user: User): Promise<User> {
    throw new Error('Method not implemented.');
  }

  async me(id: number) {
    return this.getUser(id);
  }

  async getUser(id: number) {
    return this.getStfcBasicPersonByUserNumber(String(id)).then(
      (stfcBasicPerson) => (stfcBasicPerson ? toEssUser(stfcBasicPerson) : null)
    );
  }

  async ensureDummyUserExists(userId: number): Promise<User> {
    return await postgresUserDataSource.ensureDummyUserExists(userId);
  }

  async ensureDummyUsersExist(userIds: number[]): Promise<User[]> {
    return await postgresUserDataSource.ensureDummyUsersExist(userIds);
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
        const stfcBasicPeople = await this.getStfcBasicPeopleByUserNumbers(
          userNumbers
        );

        userDetails = stfcBasicPeople.map((person) =>
          toEssBasicUserDetails(person)
        );
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
      const stfcBasicPeople = await this.getStfcBasicPeopleByUserNumbers(
        userNumbers,
        true
      );

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

    return this.getStfcBasicPeopleByUserNumbers(userNumbers).then((stfcUsers) =>
      stfcUsers.map((stfcUser) => toEssBasicUserDetails(stfcUser))
    );
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
    oidc_sub: string,
    oidc_access_htoken: string,
    oidc_refres_htoken: string,
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

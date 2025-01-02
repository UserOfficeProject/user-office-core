import { BasicPersonDetailsDTO } from '../../generated/models/BasicPersonDetailsDTO';
import { RoleDTO } from '../../generated/models/RoleDTO';
import { Country } from '../../models/Country';
import { Institution } from '../../models/Institution';
import { Role, Roles } from '../../models/Role';
import { BasicUserDetails, User } from '../../models/User';
import { AddUserRoleArgs } from '../../resolvers/mutations/AddUserRoleMutation';
import { CreateUserByEmailInviteArgs } from '../../resolvers/mutations/CreateUserByEmailInviteMutation';
import { UpdateUserArgs } from '../../resolvers/mutations/UpdateUserMutation';
import { UsersArgs } from '../../resolvers/queries/UsersQuery';
import { Cache } from '../../utils/Cache';
import PostgresUserDataSource from '../postgres/UserDataSource';
import { UserDataSource } from '../UserDataSource';
import { createUOWSClient } from './UOWSClient';

const postgresUserDataSource = new PostgresUserDataSource();
const token = process.env.EXTERNAL_AUTH_TOKEN;

const UOWSClient = createUOWSClient();

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
  'FAP Member': [Roles.FAP_REVIEWER],
  'FAP Secretary': [Roles.FAP_SECRETARY],
  'FAP Chair': [Roles.FAP_CHAIR],
  'Internal Reviewer': [Roles.INTERNAL_REVIEWER],
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

export function toStfcBasicPersonDetails(
  dto: BasicPersonDetailsDTO
): StfcBasicPersonDetails | null {
  if (!dto) {
    return null;
  }

  return {
    country: dto.country ?? '',
    deptName: dto.deptName ?? '',
    displayName: dto.displayName ?? '',
    email: dto.email ?? '',
    establishmentId: dto.establishmentId ?? '',
    familyName: dto.familyName ?? '',
    firstNameKnownAs: dto.firstNameKnownAs ?? '',
    fullName: dto.fullName ?? '',
    givenName: dto.givenName ?? '',
    initials: dto.initials ?? '',
    orgName: dto.orgName ?? '',
    orgId: 1,
    title: dto.title ?? '',
    userNumber: dto.userNumber ?? '',
    workPhone: dto.workPhone ?? '',
  };
}

export function toEssBasicUserDetails(
  stfcUser: StfcBasicPersonDetails
): BasicUserDetails {
  return new BasicUserDetails(
    Number(stfcUser.userNumber),
    stfcUser.givenName ?? '',
    stfcUser.familyName ?? '',
    stfcUser.firstNameKnownAs ?? stfcUser.givenName,
    stfcUser.orgName ?? '',
    stfcUser.orgId ?? 1,
    '',
    new Date(),
    false,
    stfcUser.email ?? '',
    stfcUser.country ?? ''
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
    stfcUser.firstNameKnownAs ?? stfcUser.givenName,
    '',
    '',
    '',
    '',
    1,
    new Date('2000-01-01'),
    1,
    stfcUser.orgName,
    stfcUser.deptName ?? '',
    '',
    stfcUser.email ?? '',
    stfcUser.workPhone ?? '',
    undefined,
    false,
    '2000-01-01 00:00:00.000000+00',
    '2000-01-01 00:00:00.000000+00'
  );
}

export class StfcUserDataSource implements UserDataSource {
  private static readonly userDetailsCacheMaxElements = 1000;
  private static readonly userDetailsCacheSecondsToLive = 600; // 10 minutes
  private static readonly rolesCacheMaxElements = 1000;
  private static readonly rolesCacheSecondsToLive = 600; //10 minutes

  private uowsBasicUserDetailsCache = new Cache<
    Promise<StfcBasicPersonDetails | undefined>
  >(
    StfcUserDataSource.userDetailsCacheMaxElements,
    StfcUserDataSource.userDetailsCacheSecondsToLive
  ).enableStatsLogging('uowsBasicUserDetailsCache');

  private uowsSearchableBasicUserDetailsCache = new Cache<
    Promise<StfcBasicPersonDetails | undefined>
  >(
    StfcUserDataSource.userDetailsCacheMaxElements,
    StfcUserDataSource.userDetailsCacheSecondsToLive
  ).enableStatsLogging('uowsSearchableBasicUserDetailsCache');

  private uowsRolesCache = new Cache<Promise<Role[]>>(
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

  public async getStfcBasicPeopleByUserNumbers(
    userNumbers: string[],
    searchableOnly?: boolean
  ): Promise<StfcBasicPersonDetails[]> {
    const cache = searchableOnly
      ? this.uowsSearchableBasicUserDetailsCache
      : this.uowsBasicUserDetailsCache;

    const stfcUserRequests: Promise<StfcBasicPersonDetails | undefined>[] = [];
    const cacheMisses: string[] = [];

    for (const userNumber of userNumbers) {
      const cachedUser = cache.get(userNumber);
      if (cachedUser) {
        stfcUserRequests.push(cachedUser);
      } else {
        cacheMisses.push(userNumber);
      }
    }

    if (cacheMisses.length > 0) {
      const uowsRequestTemp: BasicPersonDetailsDTO[] | null = searchableOnly
        ? await UOWSClient.basicPersonDetails.getSearchableBasicPersonDetails(
            undefined,
            undefined,
            cacheMisses
          )
        : await UOWSClient.basicPersonDetails.getBasicPersonDetails(
            undefined,
            undefined,
            undefined,
            cacheMisses
          );

      const uowsRequest = uowsRequestTemp
        ? uowsRequestTemp.map(toStfcBasicPersonDetails)
        : null;

      if (uowsRequest) {
        for (const userNumber of cacheMisses) {
          const userRequest = Promise.resolve(
            uowsRequest.find((user) => user?.userNumber === userNumber) ||
              undefined
          );

          cache.put(userNumber, userRequest);
          stfcUserRequests.push(userRequest);
        }

        await this.ensureDummyUsersExist(
          uowsRequest.map((stfcUser) => parseInt(stfcUser!.userNumber))
        );
      }
    }

    const stfcUsers: StfcBasicPersonDetails[] = await Promise.all(
      stfcUserRequests
    ).then((users) =>
      users.filter((user): user is StfcBasicPersonDetails => user !== undefined)
    );
    // Uncache any failed lookups
    userNumbers
      .filter(
        (un) => stfcUsers.find((user) => user.userNumber === un) === undefined
      )
      .forEach((un) => cache.remove(un));

    return stfcUsers;
  }

  private async getStfcBasicPersonByEmail(
    email: string,
    searchableOnly?: boolean
  ): Promise<StfcBasicPersonDetails | undefined> {
    const cache = searchableOnly
      ? this.uowsSearchableBasicUserDetailsCache
      : this.uowsBasicUserDetailsCache;

    const cachedUser = await cache.get(email);
    if (cachedUser) {
      return cachedUser;
    }

    const uowsRequest = (
      searchableOnly
        ? UOWSClient.basicPersonDetails.getSearchableBasicPersonDetails(
            undefined,
            [email],
            undefined
          )
        : UOWSClient.basicPersonDetails.getBasicPersonDetails(
            undefined,
            undefined,
            [email],
            undefined
          )
    )
      .then((response) => toStfcBasicPersonDetails(response[0]))
      .then((stfcUser: StfcBasicPersonDetails | null) => {
        if (!stfcUser) {
          return undefined;
        }

        return this.ensureDummyUserExists(parseInt(stfcUser.userNumber)).then(
          () => stfcUser
        );
      });

    cache.put(email, uowsRequest);

    return uowsRequest;
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

  async createInstitution(name: string): Promise<number> {
    throw new Error('Method not implemented.');
  }

  async getProposalUsersFull(proposalPk: number): Promise<User[]> {
    const users: User[] =
      await postgresUserDataSource.getProposalUsersFull(proposalPk);
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

  async setUserNotPlaceholder(id: number): Promise<User | null> {
    return await postgresUserDataSource.setUserNotPlaceholder(id);
  }

  async getByEmail(email: string): Promise<User | null> {
    const dd = this.getStfcBasicPersonByEmail(email).then((stfcUser) =>
      stfcUser ? toEssUser(stfcUser) : null
    );

    return dd;
  }

  async getByUsername(username: string): Promise<User | null> {
    // We use user numbers as usernames
    return this.getUser(parseInt(username));
  }

  async setUserRoles(id: number, roles: number[]): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async getRolesForUser(id: number): Promise<RoleDTO[]> {
    return await UOWSClient.role.getRolesForUser(id.toString());
  }
  async getUserRoles(id: number): Promise<Role[]> {
    const cachedRoles = this.uowsRolesCache.get(String(id));
    if (cachedRoles) {
      return cachedRoles;
    }

    const stfcRolesRequest = UOWSClient.role
      .getRolesForUser(id.toString())
      .then((stfcRoles) =>
        this.getRoles().then((roleDefinitions) => {
          const userRole: Role | undefined = roleDefinitions.find(
            (role) => role.shortCode == Roles.USER
          );
          if (!userRole) {
            return [];
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
            .flatMap(
              (stfcRole) => stfcRolesToEssRoleDefinitions[stfcRole.name!]
            )
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

          return userRoles;
        })
      );

    this.uowsRolesCache.put(String(id), stfcRolesRequest);

    return stfcRolesRequest;
  }

  async getRoles(): Promise<Role[]> {
    return await postgresUserDataSource.getRoles();
  }

  async update(user: UpdateUserArgs): Promise<User> {
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
  async getUsersByUserNumbers(ids: number[]) {
    const stfcBasicPersonDetails = await this.getStfcBasicPeopleByUserNumbers(
      ids.map((id) => id.toString())
    );

    return stfcBasicPersonDetails?.map((stfcbasicPerson) =>
      toEssUser(stfcbasicPerson)
    );
  }
  async getUserWithInstitution(id: number): Promise<{
    user: User;
    institution: Institution;
    country: Country;
  } | null> {
    return await postgresUserDataSource.getUserWithInstitution(id);
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

    if (filter) {
      userDetails = [];

      const BasicPeopleByLastName: BasicPersonDetailsDTO[] =
        await UOWSClient.basicPersonDetails.getBasicPersonDetails(
          undefined,
          filter,
          undefined
        );
      if (!BasicPeopleByLastName) return { totalCount: 0, users: [] };

      const stfcBasicPeopleByLastName: StfcBasicPersonDetails[] =
        BasicPeopleByLastName.map(toStfcBasicPersonDetails).filter(
          (person): person is StfcBasicPersonDetails => person !== null
        );

      userDetails = stfcBasicPeopleByLastName.map((person) =>
        toEssBasicUserDetails(person)
      );
    } else {
      const { users } = await postgresUserDataSource.getUsers({
        filter: undefined,
        first: first,
        offset: offset,
        userRole: undefined,
        subtractUsers: subtractUsers,
        orderDirection: 'asc',
      });

      if (users[0]) {
        const userNumbers: string[] = users.map((record) => String(record.id));
        const stfcBasicPeople =
          await this.getStfcBasicPeopleByUserNumbers(userNumbers);

        userDetails = stfcBasicPeople.map((person) =>
          toEssBasicUserDetails(person)
        );
      }
    }

    return {
      users: userDetails.sort((a, b) => a.id - b.id),
      totalCount: userDetails.length,
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

  async getProposalUsersWithInstitution(
    proposalPk: number
  ): Promise<{ user: User; institution: Institution; country: Country }[]> {
    return await postgresUserDataSource.getProposalUsersWithInstitution(
      proposalPk
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
    preferredname: string | undefined,
    oidc_sub: string,
    oauth_refresh_token: string,
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
  ): Promise<User> {
    throw new Error('Method not implemented.');
  }

  async getRoleByShortCode(roleShortCode: Roles): Promise<Role> {
    throw new Error('Method not implemented.');
  }

  mergeUsers(fromUserId: number, intoUserId: number): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async isSearchableUser(userId: number): Promise<boolean> {
    return !!(await this.getStfcBasicPersonByUserNumber(
      userId.toString(),
      true
    ));
  }

  async getUsersRoles(
    userIds: number[]
  ): Promise<{ userId: number; roles: Role[] }[]> {
    const usersWithRoles: { userId: number; roles: Role[] }[] =
      await Promise.all(
        userIds.map(async (userId) => ({
          userId,
          roles: await this.getUserRoles(userId),
        }))
      );

    return usersWithRoles;
  }
}

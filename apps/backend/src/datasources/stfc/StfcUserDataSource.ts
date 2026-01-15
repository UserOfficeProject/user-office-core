import { logger } from '@user-office-software/duo-logger';

import { BasicPersonDetailsDTO } from '../../../generated/models/BasicPersonDetailsDTO';
import { PermissionUserGroupDTO } from '../../../generated/models/PermissionUserGroupDTO';
import { RoleDTO } from '../../../generated/models/RoleDTO';
import { Country } from '../../models/Country';
import { Institution } from '../../models/Institution';
import { Role, Roles } from '../../models/Role';
import { BasicUserDetails, User, UserRole } from '../../models/User';
import { AddUserRoleArgs } from '../../resolvers/mutations/AddUserRoleMutation';
import { CreateUserByEmailInviteArgs } from '../../resolvers/mutations/CreateUserByEmailInviteMutation';
import { UpdateUserByIdArgs } from '../../resolvers/mutations/UpdateUserMutation';
import { UsersArgs } from '../../resolvers/queries/UsersQuery';
import { Cache } from '../../utils/Cache';
import { PaginationSortDirection } from '../../utils/pagination';
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
  'CLF Artemis FAP Secretary': [Roles.INSTRUMENT_SCIENTIST],
  'CLF Artemis Link Scientist': [Roles.INSTRUMENT_SCIENTIST],
  'CLF HPL FAP Secretary': [Roles.INSTRUMENT_SCIENTIST],
  'CLF HPL Link Scientist': [Roles.INSTRUMENT_SCIENTIST],
  'CLF LSF FAP Secretary': [Roles.INSTRUMENT_SCIENTIST],
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
    stfcUser.country ?? '',
    stfcUser.title ?? '',
    ''
  );
}

function toEssUser(stfcUser: StfcBasicPersonDetails): User {
  return new User(
    Number(stfcUser.userNumber),
    stfcUser.title ?? '',
    stfcUser.givenName ?? '',
    stfcUser.familyName ?? '',
    stfcUser.email ?? '',
    stfcUser.firstNameKnownAs ?? stfcUser.givenName,
    '',
    '',
    '',
    '',
    new Date('2000-01-01'),
    1,
    stfcUser.orgName,
    stfcUser.deptName ?? '',
    '',
    stfcUser.email ?? '',
    stfcUser.workPhone ?? '',
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

  private uopRolesCache = new Cache<Promise<Role[]>>(
    StfcUserDataSource.rolesCacheMaxElements,
    StfcUserDataSource.rolesCacheSecondsToLive
  ).enableStatsLogging('uopRolesCache');

  private stfcRolesCache = new Cache<Promise<RoleDTO[]>>(
    StfcUserDataSource.rolesCacheMaxElements,
    StfcUserDataSource.rolesCacheSecondsToLive
  ).enableStatsLogging('stfcRolesCache');

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
    const distinctUserNumbers = Array.from(new Set(userNumbers));

    const cache = searchableOnly
      ? this.uowsSearchableBasicUserDetailsCache
      : this.uowsBasicUserDetailsCache;

    const stfcUserRequests: Promise<StfcBasicPersonDetails | undefined>[] = [];
    const cacheMisses: string[] = [];

    for (const userNumber of distinctUserNumbers) {
      const cachedUser = cache.get(userNumber);
      if (cachedUser) {
        stfcUserRequests.push(cachedUser);
      } else {
        cacheMisses.push(userNumber);
      }
    }

    if (cacheMisses.length > 0) {
      // Create promise that will request a chunk of the missing user details
      // Requesting too many users at once can cause "414 Request-URI Too Long" errors
      const chunkSize = 100;
      const cacheMissChunks = Array.from(
        { length: Math.ceil(cacheMisses.length / chunkSize) },
        (_, index) =>
          cacheMisses.slice(index * chunkSize, (index + 1) * chunkSize)
      );

      const uowsRequests: Array<Promise<Array<StfcBasicPersonDetails | null>>> =
        [];

      cacheMissChunks.forEach((cacheMissChunk) => {
        const request: Promise<Array<StfcBasicPersonDetails | null>> = (
          searchableOnly
            ? UOWSClient.basicPersonDetails
                .getSearchableBasicPersonDetails(
                  undefined,
                  undefined,
                  cacheMissChunk
                )
                .catch((error) => {
                  logger.logError(
                    'An error occurred while fetching searchable person details using getSearchableBasicPersonDetails',
                    error
                  );

                  return [];
                })
            : UOWSClient.basicPersonDetails
                .getBasicPersonDetails(
                  undefined,
                  undefined,
                  undefined,
                  cacheMissChunk
                )
                .catch((error) => {
                  logger.logError(
                    'An error occurred while fetching searchable person details using getBasicPersonDetails',
                    error
                  );

                  return [];
                })
        ).then((uowsResults) => uowsResults.map(toStfcBasicPersonDetails));
        uowsRequests.push(request);
        // Build promises for individual missing users and add them to the cache.
        // Doing this as soon as possible after creating the requests and before any awaits on them ensures any parallel requests can reuse the promise and don't repeat calls for the same user data
        for (const userNumber of cacheMissChunk) {
          const userRequest = request.then(
            (users) =>
              users.find((user) => user?.userNumber === userNumber) || undefined
          );

          cache.put(userNumber, userRequest);
          stfcUserRequests.push(userRequest);
        }
      });

      // Now that all requests are made and cached, wait for the user data then store it in the database
      const usersFromUows = await Promise.all(uowsRequests).then((responses) =>
        responses.flat()
      );
      await this.ensureDummyUsersExist(
        usersFromUows.map((stfcUser) => parseInt(stfcUser!.userNumber))
      );
    }

    const stfcUsers: StfcBasicPersonDetails[] = await Promise.all(
      stfcUserRequests
    ).then((users) =>
      users.filter((user): user is StfcBasicPersonDetails => user !== undefined)
    );
    // Uncache any failed lookups
    distinctUserNumbers
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
      .then((response: BasicPersonDetailsDTO[]) =>
        toStfcBasicPersonDetails(response[0])
      )
      .then((stfcUser: StfcBasicPersonDetails | null) => {
        if (!stfcUser) {
          return undefined;
        }

        return this.ensureDummyUserExists(parseInt(stfcUser.userNumber)).then(
          () => stfcUser
        );
      })
      .catch((error) => {
        logger.logError(
          'An error occurred while fetching and processing user details using getBasicPersonDetails or getSearchableBasicPersonDetails',
          error
        );

        return undefined;
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

  getBasicUsersInfo(ids: readonly number[]): Promise<BasicUserDetails[]> {
    return this.getStfcBasicPeopleByUserNumbers(ids.map(String)).then(
      (stfcBasicPeople) =>
        stfcBasicPeople.map((person) => toEssBasicUserDetails(person))
    );
  }

  async getBasicUserDetailsByEmail(
    email: string,
    role?: UserRole,
    currentRole?: UserRole | undefined
  ): Promise<BasicUserDetails | null> {
    const searchable = currentRole !== UserRole.USER_OFFICER;

    return this.getStfcBasicPersonByEmail(email, searchable).then((stfcUser) =>
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
    const convertedStfcUser = this.getStfcBasicPersonByEmail(email).then(
      (stfcUser) => (stfcUser ? toEssUser(stfcUser) : null)
    );

    return convertedStfcUser;
  }

  async getByUsername(username: string): Promise<User | null> {
    // We use user numbers as usernames
    return this.getUser(parseInt(username));
  }

  async setUserRoles(id: number, roles: number[]): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async getRolesForUser(id: number): Promise<RoleDTO[]> {
    const cachedRoles = this.stfcRolesCache.get(String(id));
    if (cachedRoles) {
      return cachedRoles;
    }

    let stfcRawRolesRequest;
    try {
      stfcRawRolesRequest = UOWSClient.role.getRolesForUser(id.toString());
    } catch (error) {
      logger.logError(
        'An error occurred while fetching roles using getRolesForUser',
        { error }
      );
    }

    this.stfcRolesCache.put(String(id), stfcRawRolesRequest!);

    return stfcRawRolesRequest!;
  }

  async getUserRoles(id: number): Promise<Role[]> {
    const cachedRoles = this.uopRolesCache.get(String(id));
    if (cachedRoles) {
      return cachedRoles;
    }

    const stfcRawRolesRequest = this.getRolesForUser(id);

    const stfcRolesRequest = stfcRawRolesRequest.then((stfcRoles) => {
      return this.getRoles().then((roleDefinitions) => {
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
          .flatMap((stfcRole) => stfcRolesToEssRoleDefinitions[stfcRole.name!])
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
      });
    });

    this.uopRolesCache.put(String(id), stfcRolesRequest);

    return stfcRolesRequest;
  }

  async getRoles(): Promise<Role[]> {
    return await postgresUserDataSource.getRoles();
  }

  async update(user: UpdateUserByIdArgs): Promise<User> {
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

      const BasicPeopleByLastName: BasicPersonDetailsDTO[] | null =
        await UOWSClient.basicPersonDetails
          .getBasicPersonDetails(undefined, filter, undefined)
          .catch((error) => {
            logger.logError(
              'An error occurred while fetching searchable person details using getBasicPersonDetails',
              error
            );

            return null;
          });

      if (!BasicPeopleByLastName) return { totalCount: 0, users: [] };

      const stfcBasicPeopleByLastName: StfcBasicPersonDetails[] =
        BasicPeopleByLastName.map(toStfcBasicPersonDetails).filter(
          (person): person is StfcBasicPersonDetails => person !== null
        );

      userDetails = stfcBasicPeopleByLastName.map((person) =>
        toEssBasicUserDetails(person)
      );

      if (subtractUsers && subtractUsers.length > 0) {
        const usersToRemove = new Set(subtractUsers);
        userDetails = userDetails.filter((user) => !usersToRemove.has(user.id));
      }
    } else {
      const { users } = await postgresUserDataSource.getUsers({
        filter: undefined,
        first: first,
        offset: offset,
        userRole: undefined,
        subtractUsers: subtractUsers,
        sortDirection: PaginationSortDirection.asc,
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
    first?: number,
    offset?: number,
    sortField?: string,
    sortDirection?: PaginationSortDirection,
    searchText?: string,
    userRole?: UserRole,
    subtractUsers?: [number]
  ): Promise<{ totalCount: number; users: BasicUserDetails[] }> {
    const dbUsers: BasicUserDetails[] = (
      await postgresUserDataSource.getPreviousCollaborators(
        userId,
        first,
        offset,
        sortField,
        sortDirection,
        searchText,
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
    lastname: string,
    username: string,
    preferredname: string | undefined,
    oidc_sub: string,
    oauth_refresh_token: string,
    oauth_issuer: string,
    gender: string,
    birthdate: Date,
    institution: number,
    department: string,
    position: string,
    email: string,
    telephone: string
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

  async checkTechniqueScientistToProposal(
    userId: number,
    proposalPk: number
  ): Promise<boolean> {
    return await postgresUserDataSource.checkTechniqueScientistToProposal(
      userId,
      proposalPk
    );
  }

  roleAssignmentMap = new Map<number, string>([
    [50, 'FAP Chair'],
    [51, 'FAP Secretary'],
    [52, 'FAP Member'],
    [53, 'Internal Reviewer'],
  ]);

  async assignSTFCRoleToUser(userId: number, roleId: number) {
    const fapReviewerGroup: PermissionUserGroupDTO = {
      id: roleId,
      groupName: this.roleAssignmentMap.get(roleId) ?? '',
    };

    this.stfcRolesCache.remove(String(userId));
    this.uopRolesCache.remove(String(userId));

    return UOWSClient.groupMemberships.addPersonToFapGroup({
      userNumber: userId,
      groups: [fapReviewerGroup],
    });
  }

  async removeFapRoleFromUser(userId: number, roleId: number) {
    this.stfcRolesCache.remove(String(userId));
    this.uopRolesCache.remove(String(userId));

    return UOWSClient.groupMemberships.removePersonFromFapGroup(
      userId,
      this.roleAssignmentMap.get(roleId) ?? ''
    );
  }

  async getApprovedProposalVisitorsWithInstitution(
    proposalPk: number
  ): Promise<{ user: User; institution: Institution; country: Country }[]> {
    return await postgresUserDataSource.getApprovedProposalVisitorsWithInstitution(
      proposalPk
    );
  }
}

/* eslint-disable @typescript-eslint/naming-convention */
import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';
import { Knex } from 'knex';

import { Country } from '../../models/Country';
import { Institution } from '../../models/Institution';
import { Role, Roles } from '../../models/Role';
import {
  BasicUserDetails,
  User,
  UserRole,
  UserRoleShortCodeMap,
} from '../../models/User';
import { AddUserRoleArgs } from '../../resolvers/mutations/AddUserRoleMutation';
import { CreateUserByEmailInviteArgs } from '../../resolvers/mutations/CreateUserByEmailInviteMutation';
import { UpdateUserArgs } from '../../resolvers/mutations/UpdateUserMutation';
import { UsersArgs } from '../../resolvers/queries/UsersQuery';
import { UserDataSource } from '../UserDataSource';
import database from './database';
import {
  CountryRecord,
  InstitutionRecord,
  RoleRecord,
  RoleUserRecord,
  UserRecord,
  createBasicUserObject,
  createCountryObject,
  createInstitutionObject,
  createUserObject,
} from './records';

export default class PostgresUserDataSource implements UserDataSource {
  async delete(id: number): Promise<User | null> {
    return database('users')
      .where('users.user_id', id)
      .del()
      .from('users')
      .returning('*')
      .then((user: UserRecord[]) => {
        if (!user?.length) {
          return null;
        }

        return createUserObject(user[0]);
      });
  }

  async addUserRole(args: AddUserRoleArgs): Promise<boolean> {
    const { userID, roleID } = args;

    return database
      .insert({
        user_id: userID,
        role_id: roleID,
      })
      .into('role_user')
      .then(() => {
        return true;
      });
  }

  async checkEmailExist(email: string): Promise<boolean> {
    return database
      .select()
      .from('users')
      .where('email', 'ilike', email)
      .andWhere('placeholder', false)
      .first()
      .then((user: UserRecord) => (user ? true : false));
  }

  async update(user: UpdateUserArgs): Promise<User> {
    const {
      firstname,
      user_title,
      middlename,
      lastname,
      preferredname,
      gender,
      nationality,
      birthdate,
      institutionId,
      department,
      position,
      email,
      telephone,
      telephone_alt,
      placeholder,
      oidcSub,
      oauthRefreshToken,
      oauthAccessToken,
      oauthIssuer,
    } = user;

    const [userRecord]: UserRecord[] = await database
      .update({
        firstname,
        user_title,
        middlename,
        lastname,
        preferredname,
        gender,
        nationality,
        birthdate,
        institution_id: institutionId,
        department,
        position,
        email,
        telephone,
        telephone_alt,
        placeholder,
        oidc_sub: oidcSub,
        oauth_refresh_token: oauthRefreshToken,
        oauth_access_token: oauthAccessToken,
        oauth_issuer: oauthIssuer,
      })
      .from('users')
      .where('user_id', user.id)
      .returning(['*']);

    return createUserObject(userRecord);
  }
  async createInviteUser(args: CreateUserByEmailInviteArgs): Promise<number> {
    const { firstname, lastname, email } = args;

    return database
      .insert({
        user_title: '',
        firstname,
        middlename: '',
        lastname,
        username: email,
        preferredname: firstname,
        oidc_sub: '',
        oauth_refresh_token: '',
        oauth_access_token: '',
        oauth_issuer: '',
        gender: '',
        nationality: null,
        birthdate: '2000-01-01',
        institution_id: 1,
        department: '',
        position: '',
        email,
        telephone: '',
        telephone_alt: '',
        placeholder: true,
      })
      .returning(['*'])
      .into('users')
      .then((user: UserRecord[]) => user[0].user_id);
  }

  async getRoles(): Promise<Role[]> {
    return database
      .select()
      .from('roles')
      .then((roles: RoleRecord[]) =>
        roles.map((role) => new Role(role.role_id, role.short_code, role.title))
      );
  }

  async getUserRoles(id: number): Promise<Role[]> {
    return database
      .select()
      .from('roles as r')
      .join('role_user as rc', { 'r.role_id': 'rc.role_id' })
      .join('users as u', { 'u.user_id': 'rc.user_id' })
      .where('u.user_id', id)
      .then((roles: RoleRecord[]) =>
        roles.map((role) => new Role(role.role_id, role.short_code, role.title))
      );
  }

  async setUserRoles(id: number, roles: number[]): Promise<void> {
    return database.transaction(async (trx) => {
      await trx<RoleUserRecord>('role_user').where('user_id', id).del();

      await trx<RoleUserRecord>('role_user')
        .insert(
          roles.map((roleId) => ({
            user_id: id,
            role_id: roleId,
          }))
        )
        .into('role_user');
    });
  }

  async me(id: number): Promise<User | null> {
    return database
      .select()
      .from('users')
      .where('user_id', id)
      .first()
      .then((user: UserRecord) => (!user ? null : createUserObject(user)));
  }

  async getUser(id: number): Promise<User | null> {
    return database
      .select()
      .from('users')
      .where('user_id', id)
      .first()
      .then((user: UserRecord) => (!user ? null : createUserObject(user)));
  }

  async getUserWithInstitution(id: number): Promise<{
    user: User;
    institution: Institution;
    country: Country;
  } | null> {
    return database
      .select('i.*', 'c.*', 'u.*')
      .from('users as u')
      .join('institutions as i', { 'u.institution_id': 'i.institution_id' })
      .join('countries as c', { 'c.country_id': 'i.country_id' })
      .where('user_id', id)
      .first()
      .then((user: UserRecord & InstitutionRecord & CountryRecord) => {
        return !user
          ? null
          : {
              user: createUserObject(user),
              institution: createInstitutionObject(user),
              country: createCountryObject(user),
            };
      });
  }

  async getBasicUserInfo(id: number): Promise<BasicUserDetails | null> {
    return database
      .select()
      .from('users as u')
      .join('institutions as i', { 'u.institution_id': 'i.institution_id' })
      .where('user_id', id)
      .first()
      .then((user: UserRecord & InstitutionRecord) =>
        createBasicUserObject(user)
      );
  }

  async getBasicUserDetailsByEmail(
    email: string,
    role?: UserRole
  ): Promise<BasicUserDetails | null> {
    return database
      .select()
      .from('users as u')
      .join('institutions as i', { 'u.institution_id': 'i.institution_id' })
      .where('email', 'ilike', email)
      .modify((query) => {
        if (role) {
          query.join('role_user', 'role_user.user_id', '=', 'u.user_id');
          query.join('roles', 'roles.role_id', '=', 'role_user.role_id');
          query.where('roles.short_code', UserRoleShortCodeMap[role]);
        }
      })
      .first()
      .then((user: UserRecord & InstitutionRecord) =>
        !!user ? createBasicUserObject(user) : null
      );
  }

  async getByUsername(username: string): Promise<User | null> {
    return database
      .select()
      .from('users')
      .where('username', username)
      .first()
      .then((user: UserRecord) => (!user ? null : createUserObject(user)));
  }

  async getByOIDCSub(oidcSub: string): Promise<User | null> {
    if (!oidcSub) {
      return null;
    }

    return database
      .select()
      .from('users')
      .where('oidc_sub', oidcSub)
      .first()
      .then((user: UserRecord) => (!user ? null : createUserObject(user)));
  }

  async getByEmail(email: string): Promise<User | null> {
    return database
      .select()
      .from('users')
      .where('email', 'ilike', email)
      .first()
      .then((user: UserRecord) => (!user ? null : createUserObject(user)));
  }

  // NOTE: This is used in the OAuthAuthorization only where we upsert users returned from Auth server.
  async create(
    user_title: string | undefined,
    firstname: string,
    middlename: string | undefined,
    lastname: string,
    username: string,
    preferredname: string | undefined,
    oidc_sub: string,
    oauth_access_token: string,
    oauth_refresh_token: string,
    oauth_issuer: string,
    gender: string,
    nationality: number,
    birthdate: Date,
    institution_id: number,
    department: string,
    position: string,
    email: string,
    telephone: string,
    telephone_alt: string | undefined
  ): Promise<User> {
    return database
      .insert({
        user_title,
        firstname,
        middlename,
        lastname,
        username,
        preferredname,
        oidc_sub,
        oauth_access_token,
        oauth_refresh_token,
        oauth_issuer,
        gender,
        nationality,
        birthdate,
        institution_id,
        department,
        position,
        email,
        telephone,
        telephone_alt,
      })
      .returning(['*'])
      .into('users')
      .then((user: UserRecord[]) => {
        if (!user || user.length == 0) {
          throw new GraphQLError('Could not create user');
        }

        return createUserObject(user[0]);
      });
  }

  async ensureDummyUserExists(userId: number): Promise<User> {
    // ensureDummyUsersExist throws an error if it could not create all users ot was given,
    // so on success it will always return a list of exactly 1 element here.
    // In the code below, always returning the first element should therefore be safe
    return this.ensureDummyUsersExist([userId]).then((users) => users[0]);
  }

  async ensureDummyUsersExist(userIds: number[]): Promise<User[]> {
    const users: UserRecord[] = await database
      .select()
      .from('users')
      .whereIn('user_id', userIds);

    const missedUsers = userIds.filter(
      (userId) => !users.find((user) => user.user_id === userId)
    );

    if (missedUsers.length > 0) {
      logger.logInfo('Creating dummy users', { usersIds: missedUsers });

      const newUsers = await database
        .insert(userIds.map(this.createDummyUserRecord))
        .returning(['*'])
        .into('users');

      users.push(...newUsers);
    }

    if (userIds.length !== users.length) {
      const failedUsers = userIds.filter(
        (userId) => !users.find((user) => user.user_id === userId)
      );

      logger.logError('Failed to create dummy users', {
        usersIds: failedUsers,
      });
      throw new GraphQLError(`Could not create users ${failedUsers}`);
    }

    return users.map(createUserObject);
  }

  private createDummyUserRecord(userId: number) {
    return {
      user_id: userId,
      user_title: '',
      firstname: '',
      middlename: '',
      lastname: '',
      username: userId.toString(),
      preferredname: '',
      oidc_sub: '',
      oauth_refresh_token: '',
      gender: '',
      nationality: 1,
      birthdate: '2000-01-01',
      institution_id: 1,
      department: '',
      position: '',
      email: userId.toString(),
      telephone: '',
      telephone_alt: '',
    };
  }

  async getUsers({
    filter,
    first,
    offset,
    userRole,
    subtractUsers,
    orderBy,
    orderDirection = 'desc',
  }: UsersArgs): Promise<{ totalCount: number; users: BasicUserDetails[] }> {
    return database
      .select(['*', database.raw('count(*) OVER() AS full_count')])
      .from('users')
      .join('institutions as i', { 'users.institution_id': 'i.institution_id' })
      .orderBy('users.user_id', orderDirection)
      .modify((query) => {
        if (filter) {
          query.andWhere((qb) => {
            qb.where('institution', 'ilike', `%${filter}%`)
              .orWhere('firstname', 'ilike', `%${filter}%`)
              .orWhere('preferredname', 'ilike', `%${filter}%`)
              .orWhere('lastname', 'ilike', `%${filter}%`);
          });
        }
        if (first) {
          query.limit(first);
        }
        if (offset) {
          query.offset(offset);
        }
        if (userRole) {
          query.join('role_user', 'role_user.user_id', '=', 'users.user_id');
          query.join('roles', 'roles.role_id', '=', 'role_user.role_id');
          query.where('roles.short_code', UserRoleShortCodeMap[userRole]);
        }
        if (subtractUsers && subtractUsers.length > 0) {
          query.whereNotIn('users.user_id', subtractUsers);
        }
        if (orderBy) {
          query.orderBy(orderBy, orderDirection);
        }
      })
      .then((usersRecord: Array<UserRecord & InstitutionRecord>) => {
        const users = usersRecord.map((user) => createBasicUserObject(user));

        return {
          totalCount: usersRecord[0] ? usersRecord[0].full_count : 0,
          users,
        };
      });
  }

  async getPreviousCollaborators(
    userId: number,
    filter?: string,
    first?: number,
    offset?: number,
    userRole?: UserRole,
    subtractUsers?: [number]
  ): Promise<{ totalCount: number; users: BasicUserDetails[] }> {
    if (userId == -1) {
      return this.getUsers({ filter, first, offset, userRole, subtractUsers });
    }

    const lastCollaborators = await this.getMostRecentCollaborators(userId);

    const freqCollaborators = await this.getFrequentCollaborators(userId);

    const userIds = [
      ...new Set([...lastCollaborators, ...freqCollaborators, userId]),
    ];

    return database
      .select(['*', database.raw('count(*) OVER() AS full_count')])
      .from('users')
      .join('institutions as i', { 'users.institution_id': 'i.institution_id' })
      .whereIn('users.user_id', userIds)
      .modify((query) => {
        if (filter) {
          query.andWhere((qb) => {
            qb.where('institution', 'ilike', `%${filter}%`)
              .orWhere('firstname', 'ilike', `%${filter}%`)
              .orWhere('preferredname', 'ilike', `%${filter}%`)
              .orWhere('lastname', 'ilike', `%${filter}%`);
          });
        }
        if (first) {
          query.limit(first);
        }
        if (offset) {
          query.offset(offset);
        }
        if (userRole) {
          query.join('role_user', 'role_user.user_id', '=', 'users.user_id');
          query.join('roles', 'roles.role_id', '=', 'role_user.role_id');
          query.where('roles.short_code', UserRoleShortCodeMap[userRole]);
        }
        if (subtractUsers) {
          query.whereNotIn('users.user_id', subtractUsers);
        }
      })
      .then((usersRecord: Array<UserRecord & InstitutionRecord>) => {
        const users = usersRecord.map((user) => createBasicUserObject(user));

        return {
          totalCount: usersRecord[0] ? usersRecord[0].full_count : 0,
          users,
        };
      });
  }

  async getMostRecentCollaborators(id: number): Promise<number[]> {
    const fullProposalUserTable = (query: Knex.QueryBuilder) =>
      query
        .select('*')
        .from('proposal_user')
        .union(function () {
          this.column('proposal_pk', { user_id: 'proposer_id' }).from(
            'proposals'
          );
        });

    const prop: number = await database
      .with('pu', fullProposalUserTable)
      .max('pu.proposal_pk')
      .from('pu')
      .join('proposals as p', { 'pu.proposal_pk': 'p.proposal_pk' })
      .where((query) =>
        query.where('pu.user_id', id).andWhere('p.submitted', true)
      )
      .then((p) => {
        return p[0].max;
      });

    return await database
      .with('pu', fullProposalUserTable)
      .select('pu.user_id')
      .from('pu')
      .where('pu.proposal_pk', prop)
      .limit(10)
      .then((users: { user_id: number }[]) => users.map((uid) => uid.user_id));
  }

  async getFrequentCollaborators(id: number): Promise<number[]> {
    const fullProposalUser = (query: Knex.QueryBuilder) =>
      query
        .select('*')
        .from('proposal_user')
        .union(function () {
          this.column('proposal_pk', { user_id: 'proposer_id' }).from(
            'proposals'
          );
        });

    const proposals: number[] = await database
      .with('pu', fullProposalUser)
      .select('pu.proposal_pk')
      .from('pu')
      .join('proposals as p', { 'pu.proposal_pk': 'p.proposal_pk' })
      .where((query) =>
        query.where('pu.user_id', id).andWhere('p.submitted', true)
      )
      .then((props: { proposal_pk: number }[]) =>
        props.map((p) => p.proposal_pk)
      );

    return await database
      .with('pu', fullProposalUser)
      .select('pu.user_id')
      .from('pu')
      .whereIn('pu.proposal_pk', proposals)
      .groupBy('pu.user_id')
      .orderByRaw('count(pu.user_id) DESC')
      .limit(10)
      .then((users: { user_id: number }[]) => users.map((uid) => uid.user_id));
  }

  async setUserNotPlaceholder(id: number): Promise<User | null> {
    const [userRecord]: UserRecord[] = await database
      .update({
        placeholder: false,
      })
      .from('users')
      .where('user_id', id)
      .returning('*');

    return userRecord ? createUserObject(userRecord) : null;
  }

  async getProposalUsersFull(proposalPk: number): Promise<User[]> {
    return database
      .select()
      .from('users as u')
      .join('proposal_user as pc', { 'u.user_id': 'pc.user_id' })
      .join('proposals as p', { 'p.proposal_pk': 'pc.proposal_pk' })
      .where('p.proposal_pk', proposalPk)
      .then((users: UserRecord[]) => {
        return users.map((user) => createUserObject(user));
      });
  }

  async getProposalUsersWithInstitution(proposalPk: number): Promise<
    {
      user: User;
      institution: Institution;
      country: Country;
    }[]
  > {
    return database
      .select('i.*', 'c.*', 'u.*')
      .from('users as u')
      .join('proposal_user as pc', { 'u.user_id': 'pc.user_id' })
      .join('proposals as p', { 'p.proposal_pk': 'pc.proposal_pk' })
      .leftJoin('institutions as i', { 'u.institution_id': 'i.institution_id' })
      .leftJoin('countries as c', { 'c.country_id': 'i.country_id' })
      .where('p.proposal_pk', proposalPk)
      .then((users: (UserRecord & InstitutionRecord & CountryRecord)[]) => {
        return users.map((user) => {
          return {
            user: createUserObject(user),
            institution: createInstitutionObject(user),
            country: createCountryObject(user),
          };
        });
      });
  }

  async getProposalUsers(id: number): Promise<BasicUserDetails[]> {
    return database
      .select()
      .from('users as u')
      .join('institutions as i', { 'u.institution_id': 'i.institution_id' })
      .join('proposal_user as pc', { 'u.user_id': 'pc.user_id' })
      .join('proposals as p', { 'p.proposal_pk': 'pc.proposal_pk' })
      .where('p.proposal_pk', id)
      .then((users: Array<UserRecord & InstitutionRecord>) =>
        users.map((user) => createBasicUserObject(user))
      );
  }
  async createInstitution(
    name: string,
    verified: boolean,
    countryId: number | null = null
  ): Promise<number> {
    const [institution]: InstitutionRecord[] = await database
      .insert({
        institution: name,
        verified,
        country_id: countryId,
      })
      .into('institutions')
      .returning('*');

    return institution.institution_id;
  }

  async checkScientistToProposal(
    scientistId: number,
    proposalPk: number
  ): Promise<boolean> {
    const proposal = await database
      .select('*')
      .from('proposals as p')
      .join('instrument_has_scientists as ihs', {
        'ihs.user_id': scientistId,
      })
      .join('instrument_has_proposals as ihp', {
        'ihp.instrument_id': 'ihs.instrument_id',
      })
      .where('ihp.proposal_pk', proposalPk)
      .first();

    return !!proposal;
  }

  async checkInstrumentManagerToProposal(
    scientistId: number,
    proposalPk: number
  ): Promise<boolean> {
    const proposal = await database
      .select('*')
      .from('proposals as p')
      .join('instruments as i', {
        'i.manager_user_id': scientistId,
      })
      .join('instrument_has_proposals as ihp', {
        'ihp.instrument_id': 'i.instrument_id',
      })
      .where('ihp.proposal_pk', proposalPk)
      .first();

    return !!proposal;
  }

  async getRoleByShortCode(roleShortCode: Roles): Promise<Role> {
    return database
      .select()
      .from('roles')
      .where('short_code', roleShortCode)
      .first()
      .then(
        (role: RoleRecord) =>
          new Role(role.role_id, role.short_code, role.title)
      );
  }

  async mergeUsers(userFrom: number, userInto: number): Promise<void> {
    type Record = { tableName: string; columnName: string };

    const tablesToUpdate: Record[] = [
      { tableName: 'proposal_user', columnName: 'user_id' },
    ];

    for await (const row of tablesToUpdate) {
      await database(row.tableName)
        .update({
          [row.columnName]: userInto,
        })
        .where({ [row.columnName]: userFrom });
    }
  }

  async getUsersByUserNumbers(id: readonly number[]): Promise<User[]> {
    logger.logDebug('Method not implemented.', {});
    const user: User[] = [];

    return user;
  }
}

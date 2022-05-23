/* eslint-disable @typescript-eslint/naming-convention */
import { logger } from '@user-office-software/duo-logger';
import { Knex } from 'knex';

import { Role, Roles } from '../../models/Role';
import {
  User,
  BasicUserDetails,
  UserRole,
  UserRoleShortCodeMap,
} from '../../models/User';
import { AddUserRoleArgs } from '../../resolvers/mutations/AddUserRoleMutation';
import { CreateUserByEmailInviteArgs } from '../../resolvers/mutations/CreateUserByEmailInviteMutation';
import { UsersArgs } from '../../resolvers/queries/UsersQuery';
import { UserDataSource } from '../UserDataSource';
import database from './database';
import {
  UserRecord,
  createUserObject,
  createBasicUserObject,
  RoleRecord,
  RoleUserRecord,
} from './records';

export default class PostgresUserDataSource implements UserDataSource {
  async delete(id: number): Promise<User | null> {
    return database('users')
      .where('users.user_id', id)
      .del()
      .from('users')
      .returning('*')
      .then((user: UserRecord[]) => {
        if (user === undefined || user.length !== 1) {
          throw new Error(`Could not delete user with id:${id}`);
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

  async checkOrcIDExist(orcID: string): Promise<boolean> {
    return database
      .select()
      .from('users')
      .where('orcid', orcID)
      .first()
      .then((user: UserRecord) => (user ? true : false));
  }

  async getPasswordByEmail(email: string): Promise<string | null> {
    return database
      .select('password')
      .from('users')
      .where('email', 'ilike', email)
      .first()
      .then((user: UserRecord) => (user ? user.password : null));
  }

  async getPasswordByUsername(username: string): Promise<string | null> {
    return database
      .select('password')
      .from('users')
      .where('username', username)
      .first()
      .then((user: UserRecord) => (user ? user.password : null));
  }

  async update(user: User): Promise<User> {
    const {
      firstname,
      user_title,
      middlename,
      lastname,
      preferredname,
      gender,
      nationality,
      birthdate,
      organisation,
      department,
      position,
      email,
      telephone,
      telephone_alt,
      placeholder,
      orcid,
      refreshToken,
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
        organisation,
        department,
        position,
        email,
        telephone,
        telephone_alt,
        placeholder,
        orcid,
        orcid_refreshtoken: refreshToken,
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
        password: '',
        preferredname: firstname,
        orcid: '',
        orcid_refreshtoken: '',
        gender: '',
        nationality: null,
        birthdate: '2000-01-01',
        organisation: 1,
        department: '',
        position: '',
        email,
        telephone: '',
        telephone_alt: '',
        placeholder: true,
      })
      .returning(['user_id'])
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

  async setUserPassword(
    id: number,
    password: string
  ): Promise<BasicUserDetails> {
    return database
      .update({
        password,
      })
      .from('users')
      .returning('*')
      .where('user_id', id)
      .then((record: UserRecord[]) => createBasicUserObject(record[0]));
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

  async getBasicUserInfo(id: number): Promise<BasicUserDetails | null> {
    return database
      .select()
      .from('users as u')
      .join('institutions as i', { 'u.organisation': 'i.institution_id' })
      .where('user_id', id)
      .first()
      .then((user: UserRecord) => createBasicUserObject(user));
  }

  async getBasicUserDetailsByEmail(
    email: string,
    role?: UserRole
  ): Promise<BasicUserDetails | null> {
    return database
      .select()
      .from('users as u')
      .join('institutions as i', { 'u.organisation': 'i.institution_id' })
      .where('email', 'ilike', email)
      .modify((query) => {
        if (role) {
          query.join('role_user', 'role_user.user_id', '=', 'u.user_id');
          query.join('roles', 'roles.role_id', '=', 'role_user.role_id');
          query.where('roles.short_code', UserRoleShortCodeMap[role]);
        }
      })
      .first()
      .then((user: UserRecord) =>
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

  async getByOrcID(orcID: string): Promise<User | null> {
    if (!orcID) {
      return null;
    }

    return database
      .select()
      .from('users')
      .where('orcid', orcID)
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
    return database
      .insert({
        user_title,
        firstname,
        middlename,
        lastname,
        username,
        password,
        preferredname,
        orcid,
        orcid_refreshtoken,
        gender,
        nationality,
        birthdate,
        organisation,
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
          throw new Error('Could not create user');
        }

        return createUserObject(user[0]);
      });
  }

  async ensureDummyUserExists(userId: number): Promise<User> {
    let user: UserRecord[] = await database
      .select()
      .from('users')
      .where({ user_id: userId });
    if (!user || user.length == 0) {
      user = await database
        .insert({
          user_id: userId,
          user_title: '',
          firstname: '',
          middlename: '',
          lastname: '',
          username: userId.toString(),
          password: '',
          preferredname: '',
          orcid: '',
          orcid_refreshtoken: '',
          gender: '',
          nationality: 1,
          birthdate: '2000-01-01',
          organisation: 1,
          department: '',
          position: '',
          email: userId.toString(),
          telephone: '',
          telephone_alt: '',
        })
        .returning(['*'])
        .into('users');

      logger.logInfo('Creating dummy user', { userId });
    }

    if (!user || user.length == 0) {
      throw new Error(`Could not create user ${userId}`);
    }

    return createUserObject(user[0]);
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
      .join('institutions as i', { organisation: 'i.institution_id' })
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
        if (subtractUsers) {
          query.whereNotIn('users.user_id', subtractUsers);
        }
        if (orderBy) {
          if (orderBy === 'organisation') {
            query.orderBy('institution', orderDirection);
          } else {
            query.orderBy(orderBy, orderDirection);
          }
        }
      })
      .then((usersRecord: UserRecord[]) => {
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
      .join('institutions as i', { organisation: 'i.institution_id' })
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
      .then((usersRecord: UserRecord[]) => {
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

  async setUserEmailVerified(id: number): Promise<User | null> {
    const [userRecord]: UserRecord[] = await database
      .update({
        email_verified: true,
      })
      .from('users')
      .where('user_id', id)
      .returning('*');

    return userRecord ? createUserObject(userRecord) : null;
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
      .then((users: UserRecord[]) =>
        users.map((user) => createUserObject(user))
      );
  }
  async getProposalUsers(id: number): Promise<BasicUserDetails[]> {
    return database
      .select()
      .from('users as u')
      .join('institutions as i', { organisation: 'i.institution_id' })
      .join('proposal_user as pc', { 'u.user_id': 'pc.user_id' })
      .join('proposals as p', { 'p.proposal_pk': 'pc.proposal_pk' })
      .where('p.proposal_pk', id)
      .then((users: UserRecord[]) =>
        users.map((user) => createBasicUserObject(user))
      );
  }
  async createOrganisation(
    name: string,
    verified: boolean,
    countryId: number | null = null
  ): Promise<number> {
    const [institutionId]: number[] = await database
      .insert({
        institution: name,
        verified,
        country_id: countryId,
      })
      .into('institutions')
      .returning('institution_id');

    return institutionId;
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
}

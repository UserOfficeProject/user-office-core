/* eslint-disable @typescript-eslint/camelcase */
import BluePromise from 'bluebird';
import { Transaction } from 'knex';

import { Role } from '../../models/Role';
import { User, BasicUserDetails } from '../../models/User';
import { AddUserRoleArgs } from '../../resolvers/mutations/AddUserRoleMutation';
import { CreateUserByEmailInviteArgs } from '../../resolvers/mutations/CreateUserByEmailInviteMutation';
import { UserDataSource } from '../UserDataSource';
import database from './database';
import {
  UserRecord,
  createUserObject,
  createBasicUserObject,
  RoleRecord,
} from './records';

export default class PostgresUserDataSource implements UserDataSource {
  delete(id: number): Promise<User | null> {
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

  addUserRole(args: AddUserRoleArgs): Promise<boolean> {
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

  checkEmailExist(email: string): Promise<boolean> {
    return database
      .select()
      .from('users')
      .where('email', 'ilike', email)
      .andWhere('placeholder', false)
      .first()
      .then((user: UserRecord) => (user ? true : false));
  }

  checkOrcIDExist(orcID: string): Promise<boolean> {
    return database
      .select()
      .from('users')
      .where('orcid', orcID)
      .first()
      .then((user: UserRecord) => (user ? true : false));
  }

  getPasswordByEmail(email: string): Promise<string | null> {
    return database
      .select('password')
      .from('users')
      .where('email', 'ilike', email)
      .first()
      .then((user: UserRecord) => (user ? user.password : null));
  }

  getPasswordByUsername(username: string): Promise<string | null> {
    return database
      .select('password')
      .from('users')
      .where('username', username)
      .first()
      .then((user: UserRecord) => (user ? user.password : null));
  }

  update(user: User): Promise<User> {
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

    return database
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
      .returning(['*'])
      .then((user: UserRecord[]) => createUserObject(user[0]));
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
        roles.map(role => new Role(role.role_id, role.short_code, role.title))
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
        roles.map(role => new Role(role.role_id, role.short_code, role.title))
      );
  }

  async setUserRoles(id: number, roles: number[]): Promise<void> {
    return database.transaction(function(trx: Transaction) {
      return database
        .from('role_user')
        .where('user_id', id)
        .del()
        .transacting(trx)
        .then(() => {
          return BluePromise.map(roles, (role_id: number) => {
            return database
              .insert({ user_id: id, role_id: role_id })
              .into('role_user')
              .transacting(trx);
          });
        })
        .then(() => {
          trx.commit; // TODO call commit
        })
        .catch(error => {
          trx.rollback; // TODO call rollback
          throw error;
        });
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
      .then((user: UserRecord) => createUserObject(user));
  }

  async get(id: number): Promise<User | null> {
    return database
      .select()
      .from('users')
      .where('user_id', id)
      .first()
      .then((user: UserRecord) => createUserObject(user));
  }

  getBasicUserInfo(id: number): Promise<BasicUserDetails | null> {
    return database
      .select()
      .from('users as u')
      .join('institutions as i', { 'u.organisation': 'i.institution_id' })
      .where('user_id', id)
      .first()
      .then((user: UserRecord) => createBasicUserObject(user));
  }

  async getByUsername(username: string): Promise<User | null> {
    return database
      .select()
      .from('users')
      .where('username', username)
      .first()
      .then((user: UserRecord) => {
        if (!user) {
          return null;
        }

        return createUserObject(user);
      });
  }

  async getByOrcID(orcID: string): Promise<User | null> {
    return database
      .select()
      .from('users')
      .where('orcid', orcID)
      .first()
      .then((user: UserRecord) => {
        if (!user) {
          return null;
        }

        return createUserObject(user);
      });
  }

  async getByEmail(email: string): Promise<User | null> {
    return database
      .select()
      .from('users')
      .where('email', 'ilike', email)
      .first()
      .then((user: UserRecord) => {
        if (!user) {
          return null;
        }

        return createUserObject(user);
      });
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
      })
      .then((user: User) => {
        return user;
      });
  }

  async getUsers(
    filter?: string,
    first?: number,
    offset?: number,
    userRole?: number,
    subtractUsers?: [number]
  ): Promise<{ totalCount: number; users: BasicUserDetails[] }> {
    return database
      .select(['*', database.raw('count(*) OVER() AS full_count')])
      .from('users')
      .join('institutions as i', { organisation: 'i.institution_id' })
      .orderBy('user_id', 'desc')
      .modify(query => {
        if (filter) {
          query.andWhere(qb => {
            qb.where('institution', 'ilike', `%${filter}%`)
              .orWhere('firstname', 'ilike', `%${filter}%`)
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
          query.whereIn('user_id', function(this: any) {
            this.select('user_id')
              .from('role_user')
              .where('role_id', userRole);
          });
        }
        if (subtractUsers) {
          query.whereNotIn('user_id', subtractUsers);
        }
      })
      .then((usersRecord: UserRecord[]) => {
        const users = usersRecord.map(user => createBasicUserObject(user));

        return {
          totalCount: usersRecord[0] ? usersRecord[0].full_count : 0,
          users,
        };
      });
  }
  async setUserEmailVerified(id: number): Promise<void> {
    return database
      .update({
        email_verified: true,
      })
      .from('users')
      .where('user_id', id);
  }
  async getProposalUsersFull(proposalId: number): Promise<User[]> {
    return database
      .select()
      .from('users as u')
      .join('proposal_user as pc', { 'u.user_id': 'pc.user_id' })
      .join('proposals as p', { 'p.proposal_id': 'pc.proposal_id' })
      .where('p.proposal_id', proposalId)
      .then((users: UserRecord[]) => users.map(user => createUserObject(user)));
  }
  async getProposalUsers(id: number): Promise<BasicUserDetails[]> {
    return database
      .select()
      .from('users as u')
      .join('institutions as i', { organisation: 'i.institution_id' })
      .join('proposal_user as pc', { 'u.user_id': 'pc.user_id' })
      .join('proposals as p', { 'p.proposal_id': 'pc.proposal_id' })
      .where('p.proposal_id', id)
      .then((users: UserRecord[]) =>
        users.map(user => createBasicUserObject(user))
      );
  }
  async createOrganisation(name: string, verified: boolean): Promise<number> {
    return database
      .insert({
        institution: name,
        verified,
      })
      .into('institutions')
      .returning('institution_id')
      .then((id: number[]) => id[0]);
  }
}

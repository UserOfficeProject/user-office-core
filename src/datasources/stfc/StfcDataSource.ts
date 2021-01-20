/* eslint-disable @typescript-eslint/camelcase */
import { Role } from '../../models/Role';
import { Roles } from '../../models/Role';
import { BasicUserDetails, User } from '../../models/User';
import { AddUserRoleArgs } from '../../resolvers/mutations/AddUserRoleMutation';
import { CreateUserByEmailInviteArgs } from '../../resolvers/mutations/CreateUserByEmailInviteMutation';
import database from '../postgres/database';
import { UserRecord, createUserObject, RoleRecord } from '../postgres/records';
import { UserDataSource } from '../UserDataSource';
import UOWSSoapClient from './UOWSSoapInterface';

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
    0,
    '',
    0,
    stfcUser.deptName ?? '',
    '',
    stfcUser.email ?? '',
    true,
    stfcUser.workPhone ?? '',
    undefined,
    false,
    '',
    ''
  );
}

export class StfcDataSource implements UserDataSource {
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
    return database
      .select()
      .from('users as u')
      .join('proposal_user as pc', { 'u.user_id': 'pc.user_id' })
      .join('proposals as p', { 'p.proposal_id': 'pc.proposal_id' })
      .where('p.proposal_id', proposalId)
      .then(async (users: UserRecord[]) => {
        const userNumbers: string[] = users.map(user => String(user.user_id));

        const stfcBasicPeople: StfcBasicPersonDetails[] | null = (
          await client.getBasicPeopleDetailsFromUserNumbers(token, userNumbers)
        )?.return;

        if (stfcBasicPeople) {
          return stfcBasicPeople.map(person => toEssUser(person));
        } else {
          return Promise.resolve([]);
        }
      });
  }

  async getBasicUserInfo(
    id: number
  ): Promise<import('../../models/User').BasicUserDetails | null> {
    return toEssBasicUserDetails(
      (await client.getBasicPersonDetailsFromUserNumber(token, id)).return
    );
  }

  async checkOrcIDExist(orcID: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async checkEmailExist(email: string): Promise<boolean> {
    return (
      (await client.getBasicPersonDetailsFromEmail(token, email).return) != null
    );
  }

  async getPasswordByEmail(email: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  setUserEmailVerified(id: number): Promise<User | null> {
    throw new Error('Method not implemented.');
  }

  async setUserNotPlaceholder(id: number): Promise<User | null> {
    const [userRecord]: [UserRecord] = await database
      .update({
        placeholder: false,
      })
      .from('users')
      .where('user_id', id)
      .returning('*');

    return userRecord ? createUserObject(userRecord) : null;
  }

  async setUserPassword(
    id: number,
    password: string
  ): Promise<BasicUserDetails> {
    throw new Error('Method not implemented.');
  }

  async getByEmail(email: string): Promise<User | null> {
    return toEssUser(
      (await client.getBasicPersonDetailsFromEmail(token, email)).return
    );
  }

  async getByUsername(username: string): Promise<User | null> {
    return toEssUser(
      (await client.getBasicPersonDetailsFromEmail(token, username)).return
    );
  }

  async getPasswordByUsername(username: string): Promise<string | null> {
    throw new Error('Method not implemented.');
  }

  async setUserRoles(id: number, roles: number[]): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async getUserRoles(id: number): Promise<Role[]> {
    const stfcRoles: stfcRole[] = (await client.getRolesForUser(token, id))
      .return;

    const stfcRolesToEssRoles = new Map<string, Role>([
      ['User Officer', new Role(2, Roles.USER_OFFICER, 'User Officer')],
      [
        'ISIS Instrument Scientist',
        new Role(7, Roles.INSTRUMENT_SCIENTIST, 'Instrument Scientist'),
      ],
    ]);

    const roles: Role[] = [];

    // The User role must be the first item
    roles.push(new Role(0, Roles.USER, 'User'));

    stfcRoles.forEach((stfcRole: stfcRole) => {
      const essRole: Role | undefined = stfcRolesToEssRoles.get(stfcRole.name);
      if (essRole && !roles.includes(essRole)) {
        roles.push(essRole);
      }
    });

    return roles;
  }

  async getRoles(): Promise<Role[]> {
    return database
      .select()
      .from('roles')
      .then((roles: RoleRecord[]) =>
        roles.map(role => new Role(role.role_id, role.short_code, role.title))
      );
  }

  async update(user: User): Promise<User> {
    throw new Error('Method not implemented.');
  }

  async me(id: number) {
    return database
      .select()
      .from('users')
      .where('user_id', id)
      .first()
      .then((user: UserRecord) => (!user ? null : createUserObject(user)));
  }

  async get(id: number) {
    return database
      .select()
      .from('users')
      .where('user_id', id)
      .first()
      .then((user: UserRecord) => (!user ? null : createUserObject(user)));
  }

  async createDummyUser(userId: number): Promise<User> {
    return database
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
      .into('users')
      .then((user: UserRecord[]) => {
        if (!user || user.length == 0) {
          throw new Error('Could not create user');
        }

        return createUserObject(user[0]);
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
      .then(async (usersRecord: UserRecord[]) => {
        let users: BasicUserDetails[] = [];

        if (usersRecord[0]) {
          const userNumbers: string[] = usersRecord.map(record =>
            String(record.user_id)
          );
          const stfcBasicPeople: StfcBasicPersonDetails[] = (
            await client.getBasicPeopleDetailsFromUserNumbers(
              token,
              userNumbers
            )
          ).return;
          users = stfcBasicPeople.map(person => toEssBasicUserDetails(person));
        }

        return {
          totalCount: usersRecord[0] ? usersRecord[0].full_count : 0,
          users,
        };
      });
  }

  async getProposalUsers(proposalId: number): Promise<BasicUserDetails[]> {
    return database
      .select()
      .from('users as u')
      .join('proposal_user as pc', { 'u.user_id': 'pc.user_id' })
      .join('proposals as p', { 'p.proposal_id': 'pc.proposal_id' })
      .where('p.proposal_id', proposalId)
      .then(async (users: UserRecord[]) => {
        const userNumbers: string[] = users.map(user => String(user.user_id));

        const stfcBasicPeople: StfcBasicPersonDetails[] | null = (
          await client.getBasicPeopleDetailsFromUserNumbers(token, userNumbers)
        )?.return;

        if (stfcBasicPeople) {
          return stfcBasicPeople.map(person => toEssBasicUserDetails(person));
        } else {
          return Promise.resolve([]);
        }
      });
  }

  async checkScientistToProposal(
    scientistId: number,
    proposalId: number
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
      .where('ihp.proposal_id', proposalId)
      .first();

    return !!proposal;
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

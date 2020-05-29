import { Role } from '../../models/Role';
import { User, BasicUserDetails } from '../../models/User';
import { AddUserRoleArgs } from '../../resolvers/mutations/AddUserRoleMutation';
import { CreateUserByEmailInviteArgs } from '../../resolvers/mutations/CreateUserByEmailInviteMutation';
import { UserDataSource } from '../UserDataSource';

export const basicDummyUser = new BasicUserDetails(
  2,
  'john',
  'doe',
  'org',
  'boss',
  new Date('2019-07-17 08:25:12.23043+00'),
  false
);

export const basicDummyUserNotOnProposal = new BasicUserDetails(
  3,
  'john',
  'doe',
  'org',
  'boss',
  new Date('2019-07-17 08:25:12.23043+00'),
  false
);

export const dummyUserOfficer = new User(
  4,
  'Mr.',
  'John',
  'Smith',
  'Doe',
  'JoDo',
  'Hailey',
  '324235',
  '683142616',
  'male',
  12,
  '1990-01-25',
  3,
  'IT department',
  'Producer',
  'Dorris83@gmail.com',
  true,
  '(012) 325-1151',
  '1-316-182-3694',
  false,
  '2019-07-17 08:25:12.23043+00',
  '2019-07-17 08:25:12.23043+00'
);
export const dummyUser = new User(
  2,
  '',
  'Jane',
  null,
  'Doe',
  'JaDa',
  'Meta',
  '12312414',
  '568567353',
  'male',
  2,
  '1981-05-04',
  3,
  'IT department',
  'Architect',
  'Cleve30@yahoo.com',
  true,
  '045-272-7984 x34539',
  '028-065-8228 x08367',
  false,
  '2019-07-17 08:25:12.23043+00',
  '2019-07-17 08:25:12.23043+00'
);

export const dummyPlaceHolderUser = new User(
  2,
  '',
  'Jane',
  null,
  'Doe',
  'JaDa',
  'Meta',
  '12312414',
  '568567353',
  'male',
  2,
  '1981-05-04',
  3,
  'IT department',
  'Architect',
  'placeholder@ess.se',
  true,
  '045-272-7984 x34539',
  '028-065-8228 x08367',
  true,
  '2019-07-17 08:25:12.23043+00',
  '2019-07-17 08:25:12.23043+00'
);

export const dummyUserNotOnProposal = new User(
  3,
  'Dr.',
  'Noel',
  null,
  'Doe',
  'NoDO',
  'Damion',
  '182082741',
  'Apricot',
  'female',
  3,
  '1991-11-08',
  5,
  'IT department',
  'Facilitator',
  'Tyrique41@hotmail.com',
  true,
  '1-272-760-1466 x03877',
  '174-603-1024',
  false,
  '2019-07-17 08:25:12.23043+00',
  '2019-07-17 08:25:12.23043+00'
);

export class UserDataSourceMock implements UserDataSource {
  async delete(id: number): Promise<User | null> {
    return dummyUser;
  }

  async addUserRole(args: AddUserRoleArgs): Promise<boolean> {
    return true;
  }
  getByOrcID(orcID: string): Promise<User | null> {
    throw new Error('Method not implemented.');
  }
  async createInviteUser(args: CreateUserByEmailInviteArgs): Promise<number> {
    return 5;
  }
  async createOrganisation(name: string, verified: boolean): Promise<number> {
    return 1;
  }
  async getProposalUsersFull(proposalId: number): Promise<User[]> {
    throw new Error('Method not implemented.');
  }
  async getBasicUserInfo(
    id: number
  ): Promise<import('../../models/User').BasicUserDetails | null> {
    throw new Error('Method not implemented.');
  }
  async checkOrcIDExist(orcID: string): Promise<boolean> {
    return false;
  }
  async checkEmailExist(email: string): Promise<boolean> {
    return false;
  }
  async getPasswordByEmail(email: string): Promise<string> {
    return '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm';
  }
  async setUserEmailVerified(id: number): Promise<void> {
    // Do something here or remove the function.
  }
  async setUserPassword(
    id: number,
    password: string
  ): Promise<BasicUserDetails> {
    return new BasicUserDetails(
      id,
      'John',
      'Smith',
      'ESS',
      'Manager',
      new Date('2019-07-17 08:25:12.23043+00'),
      false
    );
  }
  async getByEmail(email: string): Promise<User | null> {
    if (dummyUser.email === email) {
      return dummyUser;
    } else if (dummyPlaceHolderUser.email === email) {
      return dummyPlaceHolderUser;
    } else {
      return null;
    }
  }
  async addUserForReview(
    userID: number,
    proposalID: number
  ): Promise<boolean | null> {
    return true;
  }
  async getByUsername(username: string): Promise<User | null> {
    return dummyUser;
  }
  async getPasswordByUsername(username: string): Promise<string | null> {
    return '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm';
  }
  async setUserRoles(id: number, roles: number[]): Promise<void> {
    // Do something here or remove the function.
  }
  async getUserRoles(id: number): Promise<Role[]> {
    if (id == dummyUserOfficer.id) {
      return [{ id: 1, shortCode: 'user_officer', title: 'User Officer' }];
    } else {
      return [{ id: 2, shortCode: 'user', title: 'User' }];
    }
  }

  async getRoles(): Promise<Role[]> {
    return [
      { id: 1, shortCode: 'user_officer', title: 'User Officer' },
      { id: 2, shortCode: 'user', title: 'User' },
    ];
  }

  async update(user: User): Promise<User> {
    return dummyUser;
  }

  async me(id: number) {
    return dummyUser;
  }

  async get(id: number) {
    return dummyUser;
  }

  async getUsers(
    filter?: string,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; users: BasicUserDetails[] }> {
    return {
      totalCount: 2,
      users: [basicDummyUser, basicDummyUserNotOnProposal],
    };
  }

  async getProposalUsers(id: number) {
    return [basicDummyUser];
  }

  async create(firstname: string, lastname: string) {
    return dummyUser;
  }
}

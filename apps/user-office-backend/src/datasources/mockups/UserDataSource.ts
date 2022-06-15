import { Role, Roles } from '../../models/Role';
import {
  BasicUserDetails,
  User,
  UserRole,
  UserWithRole,
} from '../../models/User';
import { AddUserRoleArgs } from '../../resolvers/mutations/AddUserRoleMutation';
import { CreateUserByEmailInviteArgs } from '../../resolvers/mutations/CreateUserByEmailInviteMutation';
import { UsersArgs } from '../../resolvers/queries/UsersQuery';
import { UserDataSource } from '../UserDataSource';

export const basicDummyUser = new BasicUserDetails(
  2,
  'john',
  'doe',
  'john',
  'org',
  'boss',
  new Date('2019-07-17 08:25:12.23043+00'),
  false
);

export const basicDummyUserNotOnProposal = new BasicUserDetails(
  3,
  'john',
  'doe',
  'john',
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
  new Date('1990-01-25'),
  3,
  'IT department',
  'Producer',
  'Dorris83@gmail.com',
  true,
  '+46700568256',
  '',
  false,
  '2019-07-17 08:25:12.23043+00',
  '2019-07-17 08:25:12.23043+00'
);

export const dummyUserOfficerWithRole: UserWithRole = {
  ...dummyUserOfficer,
  currentRole: { id: 2, title: 'User Officer', shortCode: 'user_officer' },
};

export const dummyUser = new User(
  2,
  'Dr.',
  'Jane',
  '',
  'Doe',
  'JaDa',
  'Meta',
  '12312414',
  '568567353',
  'male',
  2,
  new Date('1981-05-04'),
  3,
  'IT department',
  'Architect',
  'Cleve30@yahoo.com',
  true,
  '+38978414058',
  '+46700568256',
  false,
  '2019-07-17 08:25:12.23043+00',
  '2019-07-17 08:25:12.23043+00'
);

export const dummyPrincipalInvestigatorWithRole: UserWithRole = {
  ...dummyUser,
  id: 1,
  currentRole: { id: 1, title: 'Principal investigator', shortCode: 'pi' },
};

export const dummyUserWithRole: UserWithRole = {
  ...dummyUser,
  currentRole: { id: 1, title: 'User', shortCode: 'user' },
};

export const dummySEPChairWithRole: UserWithRole = {
  ...dummyUser,
  currentRole: { id: 4, title: 'SEP Chair', shortCode: 'sep_chair' },
};

export const dummySEPSecretaryWithRole: UserWithRole = {
  ...dummyUser,
  currentRole: { id: 5, title: 'SEP Secretary', shortCode: 'sep_secretary' },
};

export const dummySampleReviewer: UserWithRole = {
  ...dummyUser,
  currentRole: {
    id: 1,
    title: 'Sample Reviewer',
    shortCode: 'sample_safety_reviewer',
  },
};

export const dummyInstrumentScientist: UserWithRole = {
  ...dummyUser,
  id: 101,
  currentRole: {
    id: 1,
    title: 'Instrument Scientist',
    shortCode: 'instrument_scientist',
  },
};

export const dummyPlaceHolderUser = new User(
  2,
  'Dr.',
  'Jane',
  '',
  'Doe',
  'JaDa',
  'Meta',
  '12312414',
  '568567353',
  'male',
  2,
  new Date('1981-05-04'),
  3,
  'IT department',
  'Architect',
  'placeholder@ess.se',
  true,
  '+46700568256',
  '',
  true,
  '2019-07-17 08:25:12.23043+00',
  '2019-07-17 08:25:12.23043+00'
);

export const dummyUserNotOnProposal = new User(
  3,
  'Dr.',
  'Noel',
  '',
  'Doe',
  'NoDO',
  'Damion',
  '182082741',
  'Apricot',
  'female',
  3,
  new Date('1991-11-08'),
  5,
  'IT department',
  'Facilitator',
  'Tyrique41@hotmail.com',
  true,
  '+46700568256',
  '',
  false,
  '2019-07-17 08:25:12.23043+00',
  '2019-07-17 08:25:12.23043+00'
);

export const dummyUserNotOnProposalWithRole: UserWithRole = {
  ...dummyUserNotOnProposal,
  currentRole: { id: 1, title: 'User', shortCode: 'user' },
};

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
  async createOrganisation(
    name: string,
    verified: boolean,
    countryId?: number
  ): Promise<number> {
    return 1;
  }
  async getProposalUsersFull(proposalPk: number): Promise<User[]> {
    throw new Error('Method not implemented.');
  }
  async getBasicUserInfo(
    id: number
  ): Promise<import('../../models/User').BasicUserDetails | null> {
    throw new Error('Method not implemented.');
  }

  async getBasicUserDetailsByEmail(
    email: string,
    role?: UserRole
  ): Promise<import('../../models/User').BasicUserDetails | null> {
    return new BasicUserDetails(
      1,
      'John',
      'Smith',
      'John',
      'ESS',
      'Manager',
      new Date('2019-07-17 08:25:12.23043+00'),
      false
    );
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
  async setUserEmailVerified(id: number): Promise<User | null> {
    return null;
    // Do something here or remove the function.
  }
  async setUserNotPlaceholder(id: number): Promise<User | null> {
    return null;
  }
  async setUserPassword(
    id: number,
    password: string
  ): Promise<BasicUserDetails> {
    return new BasicUserDetails(
      id,
      'John',
      'Smith',
      'John',
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
    proposalPk: number
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
    } else if (id === dummyInstrumentScientist.id) {
      return [
        {
          id: 1,
          title: 'Instrument Scientist',
          shortCode: 'instrument_scientist',
        },
      ];
    } else if (id === 1001) {
      return [{ id: 2, shortCode: 'sep_reviewer', title: 'User' }];
    } else if (id === dummySEPChairWithRole.id) {
      return [{ id: 4, shortCode: 'sep_chair', title: 'SEP Chair' }];
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

  async getUser(id: number) {
    return dummyUser;
  }

  async getUsers(
    args: UsersArgs
  ): Promise<{ totalCount: number; users: BasicUserDetails[] }> {
    return {
      totalCount: 2,
      users: [basicDummyUser, basicDummyUserNotOnProposal],
    };
  }

  async getPreviousCollaborators(
    user_id: number,
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

  async checkScientistToProposal(
    scientsitId: number,
    proposalPk: number
  ): Promise<boolean> {
    if (scientsitId === dummyUserNotOnProposalWithRole.id) {
      return false;
    }

    return true;
  }
  async checkInstrumentManagerToProposal(
    scientsitId: number,
    proposalPk: number
  ): Promise<boolean> {
    if (scientsitId === dummyUserNotOnProposalWithRole.id) {
      return false;
    }

    return true;
  }

  async create(firstname: string, lastname: string) {
    return dummyUser;
  }

  async ensureDummyUserExists(userId: number): Promise<User> {
    return dummyUser;
  }

  async getRoleByShortCode(roleShortCode: Roles): Promise<Role> {
    return { id: 1, shortCode: 'user_officer', title: 'User Officer' };
  }

  async externalTokenLogin(token: string): Promise<User> {
    return dummyUser;
  }

  async logout(token: string): Promise<void> {
    return;
  }

  async isExternalTokenValid(token: string): Promise<boolean> {
    return true;
  }
}

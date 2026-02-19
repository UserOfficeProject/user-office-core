import { Country } from '../../models/Country';
import { Institution } from '../../models/Institution';
import { Role, Roles } from '../../models/Role';
import {
  BasicUserDetails,
  User,
  UserRole,
  UserWithRole,
} from '../../models/User';
import { AddUserRoleArgs } from '../../resolvers/mutations/AddUserRoleMutation';
import { UpdateUserByIdArgs } from '../../resolvers/mutations/UpdateUserMutation';
import { UsersArgs } from '../../resolvers/queries/UsersQuery';
import { PaginationSortDirection } from '../../utils/pagination';
import { UserDataSource } from '../UserDataSource';

export const basicDummyUser = new BasicUserDetails(
  2,
  'john',
  'doe',
  'john',
  'org',
  1,
  new Date('2019-07-17 08:25:12.23043+00'),
  'test@email.com',
  '',
  '',
  ''
);

export const basicDummyUserNotOnProposal = new BasicUserDetails(
  3,
  'john',
  'doe',
  'john',
  'org',
  1,
  new Date('2019-07-17 08:25:12.23043+00'),
  'test@email.com',
  '',
  '',
  ''
);

export const dummyUserOfficer = new User(
  4,
  'Mr.',
  'John',
  'Doe',
  'JoDo',
  'Hailey',
  '324235',
  '683142616',
  3,
  'issuer',
  'Dorris83@gmail.com',
  '2019-07-17 08:25:12.23043+00',
  '2019-07-17 08:25:12.23043+00'
);

export const dummyUserOfficerWithRole: UserWithRole = {
  ...dummyUserOfficer,
  currentRole: {
    id: 2,
    title: 'User Officer',
    shortCode: 'user_officer',
    description: '',
  },
  externalTokenValid: true,
};

export const dummyUser = new User(
  2,
  'Dr.',
  'Jane',
  'Doe',
  'JaDa',
  'Meta',
  '12312414',
  '568567353',
  3,
  'issuer',
  'Cleve30@yahoo.com',
  '2019-07-17 08:25:12.23043+00',
  '2019-07-17 08:25:12.23043+00'
);

export const dummyPrincipalInvestigatorWithRole: UserWithRole = {
  ...dummyUser,
  id: 1,
  currentRole: {
    id: 1,
    title: 'Principal investigator',
    shortCode: 'user',
    description: '',
  },
  externalTokenValid: true,
};

export const dummyUserWithRole: UserWithRole = {
  ...dummyUser,
  currentRole: { id: 1, title: 'User', shortCode: 'user', description: '' },
  externalTokenValid: true,
};

export const dummyFapChairWithRole: UserWithRole = {
  ...dummyUser,
  currentRole: {
    id: 4,
    title: 'Fap Chair',
    shortCode: 'fap_chair',
    description: '',
  },
  externalTokenValid: true,
};

export const dummyFapSecretaryWithRole: UserWithRole = {
  ...dummyUser,
  currentRole: {
    id: 5,
    title: 'Fap Secretary',
    shortCode: 'fap_secretary',
    description: '',
  },
  externalTokenValid: true,
};

export const dummyFapReviewerWithRole: UserWithRole = {
  ...dummyUser,
  currentRole: {
    id: 6,
    title: 'Fap Reviewer',
    shortCode: 'fap_reviewer',
    description: '',
  },
  externalTokenValid: true,
};

export const dummySampleReviewer: UserWithRole = {
  ...dummyUser,
  currentRole: {
    id: 9,
    title: 'Experiment Safety Reviewer',
    shortCode: 'experiment_safety_reviewer',
    description: '',
  },
  externalTokenValid: true,
};

export const dummyInternalReviewer: UserWithRole = {
  ...dummyUser,
  currentRole: {
    id: 1,
    title: 'Internal Reviewer',
    shortCode: 'internal_reviewer',
    description: '',
  },
};

export const dummyInstrumentScientist: UserWithRole = {
  ...dummyUser,
  id: 101,
  currentRole: {
    id: 1,
    title: 'Instrument Scientist',
    shortCode: 'instrument_scientist',
    description: '',
  },
  externalTokenValid: true,
};

export const dummyVisitorWithRole: UserWithRole = {
  ...dummyUser,
  id: 102,
  currentRole: {
    id: 1,
    title: 'Visitor',
    shortCode: 'user',
    description: '',
  },
  externalTokenValid: true,
};

export const dummyPlaceHolderUser = new User(
  5,
  'Dr.',
  'Jane',
  'Doe',
  'JaDa',
  'Meta',
  '12312414',
  '568567353',
  3,
  'issuer',
  'placeholder@ess.se',
  '2019-07-17 08:25:12.23043+00',
  '2019-07-17 08:25:12.23043+00'
);

export const dummyUserNotOnProposal = new User(
  3,
  'Dr.',
  'Noel',
  'Doe',
  'NoDO',
  'Damion',
  '182082741',
  'Apricot',
  5,
  'Tyrique41@hotmail.com',
  '+46700568256',
  '2019-07-17 08:25:12.23043+00',
  '2019-07-17 08:25:12.23043+00'
);

export const dummyUserNotOnProposalWithRole: UserWithRole = {
  ...dummyUserNotOnProposal,
  currentRole: { id: 1, title: 'User', shortCode: 'user', description: '' },
  externalTokenValid: true,
};

export class UserDataSourceMock implements UserDataSource {
  async delete(id: number): Promise<User | null> {
    return dummyUser;
  }

  async addUserRole(args: AddUserRoleArgs): Promise<boolean> {
    return true;
  }
  // Mock user storage for testing upsertUserByOidcSub
  private mockUsers: User[] = [
    dummyUser,
    dummyUserNotOnProposal,
    dummyUserOfficer,
    dummyPlaceHolderUser,
  ];

  async getByOIDCSub(oidcSub: string): Promise<User | null> {
    // Check if user exists with this OIDC sub
    const existingUser = this.mockUsers.find(
      (user) => user.oidcSub === oidcSub
    );

    return existingUser || null;
  }
  async createInstitution(name: string, countryId?: number): Promise<number> {
    return 1;
  }
  async getProposalUsersFull(proposalPk: number): Promise<User[]> {
    throw new Error('Method not implemented.');
  }
  async getBasicUserInfo(id: number): Promise<BasicUserDetails | null> {
    if (id === dummyUser.id) {
      return basicDummyUser;
    } else if (id === dummyUserNotOnProposal.id) {
      return basicDummyUserNotOnProposal;
    }

    return null;
  }
  async getBasicUsersInfo(ids: readonly number[]): Promise<BasicUserDetails[]> {
    throw new Error('Method not implemented.');
  }

  async getBasicUserDetailsByEmail(
    email: string,
    role?: UserRole
  ): Promise<BasicUserDetails> {
    return new BasicUserDetails(
      1,
      'John',
      'Smith',
      'John',
      'ESS',
      2,
      new Date('2019-07-17 08:25:12.23043+00'),
      'test@email.com',
      '',
      '',
      ''
    );
  }

  async checkEmailExist(email: string): Promise<boolean> {
    return false;
  }
  async setUserNotPlaceholder(id: number): Promise<User | null> {
    return null;
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
  async setUserRoles(id: number, roles: number[]): Promise<void> {
    // Do something here or remove the function.
  }
  async getUserRoles(id: number): Promise<Role[]> {
    if (id == dummyUserOfficer.id) {
      return [
        {
          id: 1,
          shortCode: 'user_officer',
          title: 'User Officer',
          description: '',
        },
      ];
    } else if (id === dummyInstrumentScientist.id) {
      return [
        {
          id: 1,
          title: 'Instrument Scientist',
          shortCode: 'instrument_scientist',
          description: '',
        },
      ];
    } else if (id === 1001) {
      return [
        {
          id: 2,
          shortCode: 'fap_reviewer',
          title: 'Fap Reviewer',
          description: '',
        },
      ];
    } else if (id === dummyFapChairWithRole.id) {
      return [
        { id: 4, shortCode: 'fap_chair', title: 'Fap Chair', description: '' },
      ];
    } else {
      return [{ id: 2, shortCode: 'user', title: 'User', description: '' }];
    }
  }

  async getRoles(): Promise<Role[]> {
    return [
      {
        id: 1,
        shortCode: 'user_officer',
        title: 'User Officer',
        description: '',
      },
      { id: 2, shortCode: 'user', title: 'User', description: '' },
    ];
  }

  async update(user: UpdateUserByIdArgs): Promise<User> {
    return dummyUser;
  }

  async me(id: number) {
    return dummyUser;
  }

  async getUser(id: number): Promise<User | null> {
    if (id === dummyPlaceHolderUser.id) {
      return dummyPlaceHolderUser;
    }

    return dummyUser;
  }

  async getUserWithInstitution(id: number): Promise<{
    user: User;
    institution: Institution;
    country: Country;
  } | null> {
    return null;
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
    first?: number,
    offset?: number,
    sortField?: string,
    sortDirection?: PaginationSortDirection,
    searchText?: string,
    userRole?: UserRole,
    subtractUsers?: [number]
  ): Promise<{ totalCount: number; users: BasicUserDetails[] }> {
    return {
      totalCount: 2,
      users: [basicDummyUser, basicDummyUserNotOnProposal],
    };
  }

  async getProposalUsers(id: number) {
    return [basicDummyUser];
  }

  async getProposalUsersWithInstitution(id: number): Promise<
    {
      user: User;
      institution: Institution;
      country: Country;
    }[]
  > {
    return [];
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

  async checkTechniqueScientistToProposal(
    scientistId: number,
    proposalPk: number
  ): Promise<boolean> {
    if (scientistId === dummyUserNotOnProposalWithRole.id) {
      return false;
    }

    return true;
  }

  async create(
    user_title: string | undefined,
    firstname: string,
    lastname: string,
    preferredname: string | undefined,
    oidc_sub: string,
    oauth_refresh_token: string,
    oauth_issuer: string,
    institution_id: number,
    email: string
  ) {
    // Generate a new user ID
    const newId = Math.max(...this.mockUsers.map((u) => u.id)) + 1;

    const newUser = new User(
      newId,
      user_title || 'unspecified',
      firstname,
      lastname,
      preferredname || '',
      oidc_sub,
      oauth_refresh_token,
      oauth_issuer,
      institution_id || 1,
      'Test institution',
      email,
      new Date().toISOString(),
      new Date().toISOString()
    );

    // Add to mock users collection
    this.mockUsers.push(newUser);

    return newUser;
  }

  async ensureDummyUserExists(userId: number): Promise<User> {
    return dummyUser;
  }

  async ensureDummyUsersExist(userIds: number[]): Promise<User[]> {
    return [dummyUser];
  }

  async getRoleByShortCode(roleShortCode: Roles): Promise<Role> {
    return {
      id: 1,
      shortCode: 'user_officer',
      title: 'User Officer',
      description: '',
    };
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

  async isInternalUser(
    userId: number,
    currentRole: Role | null
  ): Promise<boolean> {
    return true;
  }

  async mergeUsers(fromUserId: number, intoUserId: number): Promise<void> {
    return;
  }

  async getUsersByUserNumbers(id: readonly number[]): Promise<User[]> {
    return [dummyUser, dummyUserOfficer];
  }

  async getRolesForUser(id: number) {
    return [
      {
        name: 'ISIS Instrument Scientist',
      },
      {
        name: 'ISIS Administrator',
      },
      {
        name: 'Developer',
      },
      {
        name: 'Admin',
      },
      {
        name: 'ISIS Instrument Scientist',
      },
      {
        name: 'User Officer',
      },
      {
        name: 'User Officer',
      },
      {
        name: 'User',
      },
    ];
  }

  async getApprovedProposalVisitorsWithInstitution(proposalPk: number): Promise<
    {
      user: User;
      institution: Institution;
      country: Country;
    }[]
  > {
    return [];
  }
}

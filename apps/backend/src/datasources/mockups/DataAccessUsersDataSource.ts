import { Country } from '../../models/Country';
import { Institution } from '../../models/Institution';
import { Rejection } from '../../models/Rejection';
import { BasicUserDetails, User } from '../../models/User';
import {
  DataAccessUsersDataSource,
  UserWithInstitution,
} from '../DataAccessUsersDataSource';
import { basicDummyUser, basicDummyUserNotOnProposal } from './UserDataSource';

// Mock full user objects for getDataAccessUsersWithInstitution
export const dummyDataAccessFullUser = new User(
  100,
  'Dr.',
  'Jane',
  'Smith',
  'jane.smith',
  'Jane',
  'jane.smith.oidc',
  'refresh-token',
  10,
  'oauth-issuer',
  'jane.smith@dataaccess.org',
  '2023-01-15 10:30:00+00',
  '2023-01-15 10:30:00+00'
);

export const dummyDataAccessFullUser2 = new User(
  101,
  'Dr.',
  'Bob',
  'Johnson',
  'Bob',
  'bob.johnson.oidc',
  'refresh-token',
  'oauth-issuer',
  11,
  'Research Center',
  'bob.johnson@research.org',
  '2023-02-20 14:15:00+00',
  '2023-02-20 14:15:00+00'
);

export const dummyInstitution = new Institution(10, 'Data Access Institute', 1);
export const dummyInstitution2 = new Institution(11, 'Research Center', 2);

export const dummyCountry = new Country(1, 'Denmark');
export const dummyCountry2 = new Country(2, 'United Kingdom');

export default class MockDataAccessUsersDataSource
  implements DataAccessUsersDataSource
{
  private mockData: Map<number, number[]> = new Map([[1, []]]);

  async findByProposalPk(proposalPk: number): Promise<BasicUserDetails[]> {
    const userIds = this.mockData.get(proposalPk) || [];

    // Return mock users based on stored user IDs
    const users: BasicUserDetails[] = [];
    if (userIds.includes(basicDummyUser.id)) {
      users.push(basicDummyUser);
    }

    if (userIds.includes(basicDummyUserNotOnProposal.id)) {
      users.push(basicDummyUserNotOnProposal);
    }

    return users;
  }

  async getDataAccessUsersWithInstitution(
    proposalPk: number
  ): Promise<UserWithInstitution[]> {
    const userIds = this.mockData.get(proposalPk) || [];

    // Return mock users with institution and country based on stored user IDs
    const users: UserWithInstitution[] = [];

    if (userIds.includes(100)) {
      users.push({
        user: dummyDataAccessFullUser,
        institution: dummyInstitution,
        country: dummyCountry,
      });
    }
    if (userIds.includes(101)) {
      users.push({
        user: dummyDataAccessFullUser2,
        institution: dummyInstitution2,
        country: dummyCountry2,
      });
    }

    return users;
  }

  async updateDataAccessUsers(
    proposalPk: number,
    userIds: number[]
  ): Promise<BasicUserDetails[] | Rejection> {
    try {
      // Update mock data
      this.mockData.set(proposalPk, userIds);

      // Return updated list
      return this.findByProposalPk(proposalPk);
    } catch (error) {
      return new Rejection('Failed to update data access users', {
        proposalPk,
        userIds,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async isDataAccessUserOfProposal(
    id: number,
    proposalPk: number
  ): Promise<boolean> {
    const userIds = this.mockData.get(proposalPk) || [];

    return Promise.resolve(userIds.includes(id));
  }
}

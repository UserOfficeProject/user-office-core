import { Rejection } from '../../models/Rejection';
import { BasicUserDetails } from '../../models/User';
import { DataAccessUsersDataSource } from '../DataAccessUsersDataSource';

export const dummyDataAccessUser = new BasicUserDetails(
  100,
  'Jane',
  'Smith',
  'Jane',
  'Data Access Institute',
  10,
  'Data Analyst',
  new Date('2023-01-15 10:30:00+00'),
  false,
  'jane.smith@dataaccess.org',
  'United States'
);

export const dummyDataAccessUser2 = new BasicUserDetails(
  101,
  'Bob',
  'Johnson',
  'Bob',
  'Research Center',
  11,
  'Senior Researcher',
  new Date('2023-02-20 14:15:00+00'),
  false,
  'bob.johnson@research.org',
  'Canada'
);

export default class MockDataAccessUsersDataSource
  implements DataAccessUsersDataSource
{
  private mockData: Map<number, number[]> = new Map([
    [1, [100]], // Proposal 1 has user 100
    [2, [100, 101]], // Proposal 2 has users 100 and 101
  ]);

  async findByProposalPk(proposalPk: number): Promise<BasicUserDetails[]> {
    const userIds = this.mockData.get(proposalPk) || [];

    // Return mock users based on stored user IDs
    const users: BasicUserDetails[] = [];
    if (userIds.includes(100)) {
      users.push(dummyDataAccessUser);
    }
    if (userIds.includes(101)) {
      users.push(dummyDataAccessUser2);
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
}

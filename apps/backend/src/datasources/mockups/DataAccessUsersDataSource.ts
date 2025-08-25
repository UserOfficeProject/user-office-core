import { Rejection } from '../../models/Rejection';
import { BasicUserDetails } from '../../models/User';
import { DataAccessUsersDataSource } from '../DataAccessUsersDataSource';
import { basicDummyUser } from './UserDataSource';

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

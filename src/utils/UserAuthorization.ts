import { userDataSource, reviewDataSource } from '../datasources';
import { ReviewDataSourceMock } from '../datasources/mockups/ReviewDataSource';
import { UserDataSourceMock } from '../datasources/mockups/UserDataSource';
import PostgresReviewDataSource from '../datasources/postgres/ReviewDataSource';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { Proposal } from '../models/Proposal';
import { User, UserWithRole } from '../models/User';

export class UserAuthorization {
  constructor(
    private userDataSource: UserDataSource,
    private reviewDataSource: ReviewDataSource
  ) {}

  async isUserOfficer(agent: User | null) {
    if (agent == null) {
      return false;
    }

    return this.userDataSource.getUserRoles(agent.id).then(roles => {
      return roles.some(role => role.shortCode === 'user_officer');
    });
  }

  // NOTE: This is not a good check if it is a user or not. It should do the same check as isUserOfficer.
  async isUser(agent: User | null, id: number) {
    if (agent == null) {
      return false;
    }
    if (agent.id !== id) {
      return false;
    }

    return true;
  }

  async hasRole(agent: UserWithRole | null, role: string): Promise<boolean> {
    if (agent == null) {
      return false;
    }

    return this.userDataSource.getUserRoles(agent.id).then(roles => {
      return roles.some(roleItem => roleItem.shortCode === role);
    });
  }

  async isMemberOfProposal(agent: User | null, proposal: Proposal | null) {
    if (agent == null || proposal == null) {
      return false;
    }
    if (agent.id === proposal.proposerId) {
      return true;
    }

    return this.userDataSource.getProposalUsers(proposal.id).then(users => {
      return users.some(user => user.id === agent.id);
    });
  }

  async isReviewerOfProposal(agent: User | null, proposalID: number) {
    if (agent == null) {
      return false;
    }

    return this.reviewDataSource.getUserReviews(agent.id).then(reviews => {
      return reviews.some(review => review.proposalID === proposalID);
    });
  }

  async hasAccessRights(
    agent: User | null,
    proposal: Proposal
  ): Promise<boolean> {
    return (
      (await this.isUserOfficer(agent)) ||
      (await this.isMemberOfProposal(agent, proposal)) ||
      (await this.isReviewerOfProposal(agent, proposal.id))
    );
  }
}

let userDataSourceInstance = userDataSource;
let reviewDataSourceInstance = reviewDataSource;

if (process.env.NODE_ENV === 'test') {
  userDataSourceInstance = new UserDataSourceMock();
  reviewDataSourceInstance = new ReviewDataSourceMock() as PostgresReviewDataSource;
}

export const userAuthorization = new UserAuthorization(
  userDataSourceInstance,
  reviewDataSourceInstance
);

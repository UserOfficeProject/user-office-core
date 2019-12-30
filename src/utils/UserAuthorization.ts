import { User } from "../models/User";
import { Proposal } from "../models/Proposal";
import { UserDataSource } from "../datasources/UserDataSource";
import { ReviewDataSource } from "../datasources/ReviewDataSource";

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
      return roles.some(role => role.shortCode === "user_officer");
    });
  }

  async isUser(agent: User | null, id: number) {
    if (agent == null) {
      return false;
    }
    if (agent.id !== id) {
      return false;
    }
    return true;
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

import { User } from "../models/User";
import { Proposal } from "../models/Proposal";
import { UserDataSource } from "../datasources/UserDataSource";
import { ProposalDataSource } from "../datasources/ProposalDataSource";

export class UserAuthorization {
  constructor(
    private userDataSource: UserDataSource,
    private proposalDataSource: ProposalDataSource
  ) {}

  async isUserOfficer(agent: User | null) {
    if (agent == null) {
      return false;
    }

    return this.userDataSource.getUserRoles(agent.id).then(roles => {
      return roles.some(role => role.shortCode === "user_officer");
    });
  }

  async isUser(agent: User | null, id: string) {
    if (agent == null) {
      return false;
    }
    if (agent.id !== parseInt(id)) {
      return false;
    }
    return true;
  }

  async isMemberOfProposal(agent: User | null, proposal: Proposal | null) {
    if (agent == null || proposal == null) {
      return false;
    }
    return this.userDataSource.getProposalUsers(proposal.id).then(users => {
      return users.some(user => user.id === agent.id);
    });
  }
}

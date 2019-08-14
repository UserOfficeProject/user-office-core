import { UserDataSource } from "../datasources/UserDataSource";
import { User } from "../models/User";
import { UserAuthorization } from "../utils/UserAuthorization";

export default class UserQueries {
  constructor(
    private dataSource: UserDataSource,
    private userAuth: UserAuthorization
  ) {}

  async getAgent(id: number) {
    return this.dataSource.get(id);
  }

  async get(agent: User | null, id: number) {
    if (
      (await this.userAuth.isUserOfficer(agent)) ||
      (await this.userAuth.isUser(agent, id))
    ) {
      return this.dataSource.get(id);
    } else {
      return null;
    }
  }

  async getAll(
    agent: User | null,
    filter?: string,
    first?: number,
    offset?: number
  ) {
    if (agent == null) {
      return null;
    }
    return this.dataSource.getUsers(filter, first, offset);
  }

  async getRoles(agent: User | null) {
    if (await this.userAuth.isUserOfficer(agent)) {
      return this.dataSource.getRoles();
    } else {
      return null;
    }
  }

  async getProposers(agent: User | null, proposalId: number) {
    return this.dataSource.getProposalUsers(proposalId);
  }
}

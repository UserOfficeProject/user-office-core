import { ProposalDataSource } from "../datasources/ProposalDataSource";
import { User } from "../models/User";

export default class ProposalQueries {
  constructor(private dataSource: ProposalDataSource, private userAuth: any) {}

  async get(id: number, agent: User | null) {
    const proposal = await this.dataSource.get(id);
    if (
      (await this.userAuth.isUserOfficer(agent)) ||
      (await this.userAuth.isMemberOfProposal(agent, proposal))
    ) {
      return proposal;
    } else {
      return null;
    }
  }

  async getAll(agent: User | null) {
    if (await this.userAuth.isUserOfficer(agent)) {
      return this.dataSource.getProposals();
    } else {
      return null;
    }
  }
}

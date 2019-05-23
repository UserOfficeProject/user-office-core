import { ProposalDataSource } from "../ProposalDataSource";
import Proposal from "../../models/Proposal";

export const dummyProposal = new Proposal(1, "asd", 1);

export class proposalDataSource implements ProposalDataSource {
  public dummyProposal = new Proposal(1, "asd", 1);

  async acceptProposal(id: number): Promise<Proposal | null> {
    return this.dummyProposal;
  }

  async get(id: number) {
    return this.dummyProposal;
  }

  async create(abstract: string, status: number, users: number[]) {
    return this.dummyProposal;
  }

  async getProposals() {
    return this.dummyProposal;
  }

  async getUserProposals(id: number) {
    return this.dummyProposal;
  }
}

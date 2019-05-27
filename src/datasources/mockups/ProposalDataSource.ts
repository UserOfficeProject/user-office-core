import { ProposalDataSource } from "../ProposalDataSource";
import Proposal from "../../models/Proposal";

export const dummyProposal = new Proposal(1, "asd", 1);

export class proposalDataSource implements ProposalDataSource {
  async acceptProposal(id: number): Promise<Proposal | null> {
    return dummyProposal;
  }

  async get(id: number) {
    return dummyProposal;
  }

  async create(abstract: string, status: number, users: number[]) {
    return dummyProposal;
  }

  async getProposals() {
    return dummyProposal;
  }

  async getUserProposals(id: number) {
    return dummyProposal;
  }
}

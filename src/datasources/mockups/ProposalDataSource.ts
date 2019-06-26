import { ProposalDataSource } from "../ProposalDataSource";
import Proposal from "../../models/Proposal";

export const dummyProposal = new Proposal(1, "title", "abstract", 1);

export class proposalDataSource implements ProposalDataSource {
  rejectProposal(id: number): Promise<Proposal | null> {
    throw new Error("Method not implemented.");
  }
  async update(proposal: Proposal): Promise<Proposal | null> {
    return dummyProposal;
  }
  setProposalUsers(id: number, users: number[]): boolean {
    return true;
  }
  async acceptProposal(id: number): Promise<Proposal | null> {
    if (id && id > 0) {
      return dummyProposal;
    }
    return null;
  }

  async submitProposal(id: number): Promise<Proposal | null> {
    if (id && id > 0) {
      return dummyProposal;
    }
    return null;
  }

  async get(id: number) {
    return dummyProposal;
  }

  async create() {
    return dummyProposal;
  }

  async getProposals() {
    return dummyProposal;
  }

  async getUserProposals(id: number) {
    return dummyProposal;
  }
}

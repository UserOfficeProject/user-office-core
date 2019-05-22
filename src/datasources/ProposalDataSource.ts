import Proposal from "../models/Proposal";

export interface ProposalDataSource {
  // Read
  get(id: number): Promise<Proposal | null>;
  getProposals(): Promise<Proposal | null>;
  getUserProposals(id: number): Promise<Proposal | null>;
  // Write
  create(
    abstract: string,
    status: number,
    users: number[]
  ): Promise<Proposal | null>;
  acceptProposal(id: number): Promise<Proposal | null>;
}

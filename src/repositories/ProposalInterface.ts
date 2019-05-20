import Proposal from "../models/Proposal";
//This is the agreement between collaborating sites
export interface ProposalDataSource {
  get(id: number): Promise<Proposal | null>;
  acceptProposal(id: number): Promise<Proposal | null>;
  getProposals(): Promise<Proposal | null>;
  getUserProposals(id: number): Promise<Proposal | null>;
  create(
    abstract: string,
    status: number,
    users: number[]
  ): Promise<Proposal | null>;
}

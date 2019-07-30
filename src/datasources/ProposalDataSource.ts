import { Proposal } from "../models/Proposal";
import { Review } from "../models/Review";

export interface ProposalDataSource {
  submitReview(
    reviewID: number,
    comment: string,
    grade: number
  ): Promise<Review | null>;
  // Read
  get(id: number): Promise<Proposal | null>;
  getProposals(
    filter?: string,
    first?: number,
    offset?: number
  ): Promise<Proposal[]>;
  getUserProposals(id: number): Promise<Proposal[]>;
  // Write
  create(id: number): Promise<Proposal | null>;
  update(proposal: Proposal): Promise<Proposal | null>;
  setProposalUsers(id: number, users: number[]): Promise<Boolean>;
  acceptProposal(id: number): Promise<Proposal | null>;
  rejectProposal(id: number): Promise<Proposal | null>;
  submitProposal(id: number): Promise<Proposal | null>;
}

import {
  Proposal,
  ProposalTemplate,
  ProposalAnswer,
  Topic
} from "../models/Proposal";

export interface ProposalDataSource {
  // Read
  get(id: number): Promise<Proposal | null>;
  checkActiveCall(): Promise<Boolean>;
  getProposals(
    filter?: string,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; proposals: Proposal[] }>;
  getUserProposals(id: number): Promise<Proposal[]>;
  getProposalTemplate(): Promise<ProposalTemplate>;

  // Write
  create(id: number): Promise<Proposal | null>;
  update(proposal: Proposal): Promise<Proposal | null>;
  setProposalUsers(id: number, users: number[]): Promise<Boolean>;
  acceptProposal(id: number): Promise<Proposal | null>;
  rejectProposal(id: number): Promise<Proposal | null>;
  submitProposal(id: number): Promise<Proposal | null>;
  updateAnswer(
    proposal_id: number,
    question_id: string,
    answer: string
  ): Promise<Boolean>;
  insertFiles(
    proposal_id: number,
    question_id: string,
    files: string[]
  ): Promise<string[] | null>;
  deleteFiles(
    proposal_id: number,
    question_id: string
  ): Promise<Boolean | null>;
  getProposalAnswers(proposalId: number): Promise<ProposalAnswer[]>;
  createTopic(title: string): Promise<Topic>;
  updateTopic(id:number, title:string):Promise<Topic>;
}

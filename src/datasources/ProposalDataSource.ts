import {
  Proposal,
  ProposalTemplate,
  ProposalAnswer,
  Topic,
  ProposalTemplateField,
  FieldDependency,
  DataType
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
  getProposalAnswers(proposalId: number): Promise<ProposalAnswer[]>;

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
  createTopic(title: string): Promise<Topic>;
  updateTopic(
    id: number,
    values: { title?: string; isEnabled?: boolean; sortOrder?: number }
  ): Promise<Topic | null>;
  updateField(
    proposal_question_id: string,
    values: {
      dataType?: string;
      question?: string;
      topicId?: number;
      config?: string;
      sortOrder?: number;
      dependencies?: FieldDependency[];
    }
  ): Promise<ProposalTemplate | null>;
  createTemplateField(
    fieldId: string,
    topicId: number,
    dataType: DataType,
    question: string,
    config: string
  ): Promise<ProposalTemplateField | null>;
  deleteTemplateField(fieldId: string): Promise<ProposalTemplate | null>;
  deleteTopic(id: number): Promise<Boolean | null>;
}

import { ProposalDataSource } from "../ProposalDataSource";
import {
  Proposal,
  ProposalTemplate,
  ProposalTemplateField,
  DataType,
  FieldDependency,
  Topic,
  ProposalAnswer
} from "../../models/Proposal";

export const dummyProposal = new Proposal(
  1,
  "title",
  "abstract",
  1, // main proposer
  0, // status
  "2019-07-17 08:25:12.23043+00",
  "2019-07-17 08:25:12.23043+00"
);

export const dummyProposalSubmitted = new Proposal(
  2,
  "submitted proposal",
  "abstract",
  1, // main proposer
  1, // status
  "2019-07-17 08:25:12.23043+00",
  "2019-07-17 08:25:12.23043+00"
);

export const dummyAnswers: Array<ProposalAnswer> = [
  {
    proposal_question_id: "has_references",
    data_type: DataType.BOOLEAN,
    value: "true"
  },
  {
    proposal_question_id: "fasta_seq",
    data_type: DataType.TEXT_INPUT,
    value: "ADQLTEEQIAEFKEAFSLFDKDGDGTITTKELG*"
  }
];

export class proposalDataSource implements ProposalDataSource {
  createTemplateField(fieldId: string, topicId: number, dataType: DataType, question: string, config: string): Promise<ProposalTemplateField | null> {
    throw new Error("Method not implemented.");
  }
  async updateField(
    proposal_question_id: string,
    values: {
      data_type?: string | undefined;
      question?: string | undefined;
      topic?: number | undefined;
      config?: string | undefined;
      sort_order: number;
    }
  ): Promise<ProposalTemplateField | null> {
    return new ProposalTemplateField(
      proposal_question_id,
      DataType.BOOLEAN,
      0,
      "Question",
      1,
      null,
      null
    );
  }

  async updateTopic(
    id: number,
    values: { title?: string; isEnabled?: boolean }
  ): Promise<Topic> {
    return new Topic(
      id,
      values.title || "Topic title",
      values.isEnabled !== undefined ? values.isEnabled : true,
      3,
      null
    );
  }

  
  async createTopic(title: string): Promise<Topic> {
    return new Topic(2, title, false, 2, null);
  }
  async getProposalAnswers(proposalId: number): Promise<ProposalAnswer[]> {
    return dummyAnswers;
  }
  async insertFiles(
    proposal_id: number,
    question_id: string,
    files: string[]
  ): Promise<string[]> {
    return files;
  }
  async deleteFiles(
    proposal_id: number,
    question_id: string
  ): Promise<Boolean> {
    return true;
  }

  async updateAnswer(
    proposal_id: number,
    question_id: string,
    answer: string
  ): Promise<Boolean> {
    return true;
  }
  async checkActiveCall(): Promise<Boolean> {
    return true;
  }

  async getProposalTemplate(): Promise<ProposalTemplate> {
    var hasLinksToField = new ProposalTemplateField(
      "hasLinksToField",
      DataType.SELECTION_FROM_OPTIONS,
      0,
      "Has any links to field?",
      1,
      JSON.stringify({ variant: "radio", options: ["yes", "no"] }),
      null
    );

    var linksToField = new ProposalTemplateField(
      "linksToField",
      DataType.TEXT_INPUT,
      1,
      "Please specify",
      1,
      null,
      [
        new FieldDependency(
          "linksToField",
          "hasLinksToField",
          "{ 'ifValue': 'yes' }"
        )
      ]
    );
    return new ProposalTemplate([
      new Topic(1, "General information", true, 1, [
        hasLinksToField,
        linksToField
      ])
    ]);
  }

  async submitReview(
    reviewID: number,
    comment: string,
    grade: number
  ): Promise<import("../../models/Review").Review | null> {
    throw new Error("Method not implemented.");
  }
  async rejectProposal(id: number): Promise<Proposal | null> {
    if (id && id > 0) {
      return dummyProposal;
    }
    return null;
  }
  async update(proposal: Proposal): Promise<Proposal | null> {
    if (proposal.id && proposal.id > 0) {
      if (proposal.id == dummyProposalSubmitted.id) {
        return dummyProposalSubmitted;
      } else {
        return dummyProposal;
      }
    }
    return null;
  }
  async setProposalUsers(id: number, users: number[]): Promise<Boolean> {
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
    if (id && id > 0) {
      if (id == dummyProposalSubmitted.id) {
        return dummyProposalSubmitted;
      } else {
        return dummyProposal;
      }
    }
    return null;
  }

  async create(proposerID: number) {
    return dummyProposal;
  }

  async getProposals(
    filter?: string,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; proposals: Proposal[] }> {
    return { totalCount: 1, proposals: [dummyProposal] };
  }

  async getUserProposals(id: number) {
    return [dummyProposal];
  }
}

import { ProposalDataSource } from "../ProposalDataSource";
import {
  ProposalTemplate,
  DataType,
  ProposalAnswer,
  Questionary,
  ProposalStatus
} from "../../models/ProposalModel";
import { Proposal } from "../../models/Proposal";
import { create1Topic3FieldWithDependenciesQuestionary } from "../../tests/ProposalTestBed";

export var dummyTemplate: ProposalTemplate;
export var dummyQuestionary: Questionary;
export var dummyProposal: Proposal;
export var dummyProposalSubmitted: Proposal;
export var dummyAnswers: ProposalAnswer[];

export class proposalDataSource implements ProposalDataSource {
  public init() {
    dummyQuestionary = create1Topic3FieldWithDependenciesQuestionary();

    dummyProposal = new Proposal(
      1,
      "title",
      "abstract",
      1, // main proposer
      ProposalStatus.DRAFT, // status
      "2019-07-17 08:25:12.23043+00",
      "2019-07-17 08:25:12.23043+00",
      "GQX639"
    );

    dummyProposalSubmitted = new Proposal(
      2,
      "submitted proposal",
      "abstract",
      1, // main proposer
      ProposalStatus.SUBMITTED, // status
      "2019-07-17 08:25:12.23043+00",
      "2019-07-17 08:25:12.23043+00",
      "GQX639"
    );

    dummyAnswers = [
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
  }
  async deleteProposal(id: number): Promise<Proposal | null> {
    return dummyProposal;
  }
  async updateTopicCompletenesses(
    id: number,
    topicsCompleted: number[]
  ): Promise<Boolean | null> {
    return true;
  }
  async getQuestionary(proposalId: number): Promise<Questionary> {
    return dummyQuestionary;
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
  ): Promise<string[]> {
    return ["file_id_012345"];
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

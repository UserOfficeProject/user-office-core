import 'reflect-metadata';
import { Proposal } from '../../models/Proposal';
import {
  DataType,
  ProposalAnswer,
  ProposalStatus,
  ProposalTemplate,
  Questionary,
} from '../../models/ProposalModel';
import { create1Topic3FieldWithDependenciesQuestionary } from '../../tests/ProposalTestBed';
import { ProposalDataSource } from '../ProposalDataSource';
import { ProposalsFilter } from './../../resolvers/queries/ProposalsQuery';

export let dummyTemplate: ProposalTemplate;
export let dummyQuestionary: Questionary;
export let dummyProposal: Proposal;
export let dummyProposalSubmitted: Proposal;
export let dummyAnswers: ProposalAnswer[];

export class ProposalDataSourceMock implements ProposalDataSource {
  public init() {
    dummyQuestionary = create1Topic3FieldWithDependenciesQuestionary();

    dummyProposal = new Proposal(
      1,
      'title',
      'abstract',
      1, // main proposer
      ProposalStatus.DRAFT, // status
      new Date('2019-07-17 08:25:12.23043+00'),
      new Date('2019-07-17 08:25:12.23043+00'),
      'GQX639',
      1,
      1
    );

    dummyProposalSubmitted = new Proposal(
      2,
      'submitted proposal',
      'abstract',
      1, // main proposer
      ProposalStatus.SUBMITTED, // status
      new Date('2019-07-17 08:25:12.23043+00'),
      new Date('2019-07-17 08:25:12.23043+00'),
      'GQX639',
      1,
      1
    );

    // TODO: Check if this can be done in camelcase.
    /* eslint-disable @typescript-eslint/camelcase */
    dummyAnswers = [
      {
        proposal_question_id: 'has_references',
        data_type: DataType.BOOLEAN,
        value: 'true',
      },
      {
        proposal_question_id: 'fasta_seq',
        data_type: DataType.TEXT_INPUT,
        value: 'ADQLTEEQIAEFKEAFSLFDKDGDGTITTKELG*',
      },
    ];
    /* eslint-enable @typescript-eslint/camelcase */
  }

  async deleteProposal(id: number): Promise<Proposal> {
    return dummyProposal;
  }

  async updateTopicCompletenesses(
    id: number,
    topicsCompleted: number[]
  ): Promise<void> {
    // Do something here or remove the function
  }

  async getQuestionary(proposalId: number): Promise<Questionary> {
    return dummyQuestionary;
  }

  async insertFiles(
    proposalId: number,
    questionId: string,
    files: string[]
  ): Promise<string[]> {
    return files;
  }

  async deleteFiles(proposalId: number, questionId: string): Promise<string[]> {
    return ['file_id_012345'];
  }

  async updateAnswer(
    proposalId: number,
    questionId: string,
    answer: string
  ): Promise<string> {
    return questionId;
  }

  async checkActiveCall(): Promise<boolean> {
    return true;
  }

  async rejectProposal(id: number): Promise<Proposal> {
    if (id && id > 0) {
      return dummyProposal;
    }
    throw new Error('Wrong ID');
  }

  async update(proposal: Proposal): Promise<Proposal> {
    if (proposal.id && proposal.id > 0) {
      if (proposal.id == dummyProposalSubmitted.id) {
        return dummyProposalSubmitted;
      } else {
        return dummyProposal;
      }
    }
    throw new Error('Error');
  }

  async setProposalUsers(id: number, users: number[]): Promise<void> {
    // Do something here or remove the function
  }

  async acceptProposal(id: number): Promise<Proposal> {
    if (id && id > 0) {
      return dummyProposal;
    }
    throw new Error('Wrong ID');
  }

  async submitProposal(id: number): Promise<Proposal> {
    if (id && id > 0) {
      return dummyProposal;
    }
    throw new Error('Wrong ID');
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
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; proposals: Proposal[] }> {
    return { totalCount: 1, proposals: [dummyProposal] };
  }

  async getUserProposals(id: number) {
    return [dummyProposal];
  }
}

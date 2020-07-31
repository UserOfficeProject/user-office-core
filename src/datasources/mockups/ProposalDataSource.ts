/* eslint-disable @typescript-eslint/camelcase */
import 'reflect-metadata';
import { Proposal } from '../../models/Proposal';
import { ProposalEndStatus, ProposalStatus } from '../../models/ProposalModel';
import { ProposalDataSource } from '../ProposalDataSource';
import { ProposalsFilter } from './../../resolvers/queries/ProposalsQuery';

export let dummyProposal: Proposal;
export let dummyProposalSubmitted: Proposal;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>;
};

const dummyProposalFactory = (values?: Partial<Proposal>) => {
  return new Proposal(
    values?.id || 1,
    values?.title || 'title',
    values?.abstract || 'abstract',
    values?.proposerId || 1,
    values?.status || ProposalStatus.DRAFT,
    values?.created || new Date(),
    values?.updated || new Date(),
    values?.shortCode || 'shortCode',
    values?.rankOrder || 0,
    values?.finalStatus || 0,
    values?.callId || 0,
    values?.questionaryId || 1,
    values?.commentForUser || 'comment for user',
    values?.commentForManagement || 'comment for management',
    false
  );
};

export class ProposalDataSourceMock implements ProposalDataSource {
  public init() {
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
      1,
      1,
      1,
      '',
      '',
      false
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
      1,
      1,
      1,
      '',
      '',
      false
    );
  }

  async deleteProposal(id: number): Promise<Proposal> {
    const dummyProposalRef = dummyProposalFactory(dummyProposal);
    dummyProposal.id = -1; // hacky

    return dummyProposalRef;
  }

  async checkActiveCall(callId: number): Promise<boolean> {
    return true;
  }

  async rejectProposal(proposalId: number): Promise<Proposal> {
    if (dummyProposal.id !== proposalId) {
      throw new Error('Wrong ID');
    }

    dummyProposal.finalStatus = ProposalEndStatus.REJECTED; // What is the final status for rejecte?

    return dummyProposal;
  }

  async update(proposal: Proposal): Promise<Proposal> {
    if (proposal.id !== dummyProposal.id) {
      throw new Error('Proposal does not exist');
    }
    dummyProposal = proposal;

    return dummyProposal;
  }

  async setProposalUsers(id: number, users: number[]): Promise<void> {
    throw new Error('Not implemented');
  }

  async submitProposal(id: number): Promise<Proposal> {
    if (id !== dummyProposal.id) {
      throw new Error('Wrong ID');
    }
    dummyProposal.status = ProposalStatus.SUBMITTED;

    return dummyProposal;
  }

  async get(id: number) {
    return id === dummyProposal.id ? dummyProposal : null;
  }

  async create(proposerId: number, callId: number, questionaryId: number) {
    dummyProposal.proposerId = proposerId;
    dummyProposal.callId = callId;
    dummyProposal.questionaryId = questionaryId;

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

  async getInstrumentScientistProposals(
    scientsitId: number,
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ) {
    return { totalCount: 1, proposals: [dummyProposal] };
  }
}

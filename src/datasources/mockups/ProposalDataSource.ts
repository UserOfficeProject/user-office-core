/* eslint-disable @typescript-eslint/camelcase */
import 'reflect-metadata';
import { Event } from '../../events/event.enum';
import { Proposal, ProposalEndStatus } from '../../models/Proposal';
import { ProposalView } from '../../models/ProposalView';
import { ProposalEventsRecord } from '../postgres/records';
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
    values?.statusId || 1,
    values?.created || new Date(),
    values?.updated || new Date(),
    values?.shortCode || 'shortCode',
    values?.rankOrder || 0,
    values?.finalStatus || 0,
    values?.callId || 0,
    values?.questionaryId || 1,
    values?.commentForUser || 'comment for user',
    values?.commentForManagement || 'comment for management',
    false,
    false
  );
};

export class ProposalDataSourceMock implements ProposalDataSource {
  async getProposalsFromView(
    filter?: ProposalsFilter | undefined
  ): Promise<ProposalView[]> {
    return [];
  }
  public init() {
    dummyProposal = new Proposal(
      1,
      'title',
      'abstract',
      1, // main proposer
      1, // status
      new Date('2019-07-17 08:25:12.23043+00'),
      new Date('2019-07-17 08:25:12.23043+00'),
      'GQX639',
      1,
      1,
      1,
      1,
      '',
      '',
      false,
      false
    );

    dummyProposalSubmitted = new Proposal(
      2,
      'submitted proposal',
      'abstract',
      1, // main proposer
      2, // status
      new Date('2019-07-17 08:25:12.23043+00'),
      new Date('2019-07-17 08:25:12.23043+00'),
      'GQX639',
      1,
      1,
      1,
      1,
      '',
      '',
      false,
      true
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

  async updateProposalStatus(
    proposalId: number,
    proposalStatusId: number
  ): Promise<Proposal> {
    if (proposalId !== dummyProposal.id) {
      throw new Error('Proposal does not exist');
    }

    return dummyProposal;
  }

  async setProposalUsers(id: number, users: number[]): Promise<void> {
    throw new Error('Not implemented');
  }

  async submitProposal(id: number): Promise<Proposal> {
    if (id !== dummyProposal.id) {
      throw new Error('Wrong ID');
    }
    dummyProposal.submitted = true;

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

  async markEventAsDoneOnProposal(
    event: Event,
    proposalId: number
  ): Promise<ProposalEventsRecord | null> {
    return {
      proposal_id: 1,
      proposal_created: true,
      proposal_submitted: true,
      call_ended: false,
      proposal_sep_selected: false,
      proposal_instrument_selected: false,
      proposal_feasibility_review_submitted: false,
      proposal_sample_review_submitted: false,
      proposal_all_sep_reviewers_selected: false,
      proposal_sep_review_submitted: false,
      proposal_sep_meeting_submitted: false,
      proposal_instrument_submitted: false,
      proposal_accepted: false,
      proposal_rejected: false,
      proposal_notified: false,
    };
  }
}

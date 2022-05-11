import 'reflect-metadata';
import { Event } from '../../events/event.enum';
import { AllocationTimeUnits, Call } from '../../models/Call';
import {
  Proposal,
  ProposalEndStatus,
  ProposalPksWithNextStatus,
} from '../../models/Proposal';
import { ProposalView } from '../../models/ProposalView';
import { ScheduledEventCore } from '../../models/ScheduledEventCore';
import { SepMeetingDecision } from '../../models/SepMeetingDecision';
import {
  TechnicalReview,
  TechnicalReviewStatus,
} from '../../models/TechnicalReview';
import { UpdateTechnicalReviewAssigneeInput } from '../../resolvers/mutations/UpdateTechnicalReviewAssignee';
import {
  ProposalBookingFilter,
  ProposalBookingScheduledEventFilterCore,
  ProposalBookingStatusCore,
  ScheduledEventBookingType,
} from '../../resolvers/types/ProposalBooking';
import { ProposalEventsRecord } from '../postgres/records';
import { ProposalDataSource } from '../ProposalDataSource';
import { ProposalsFilter } from './../../resolvers/queries/ProposalsQuery';
import { basicDummyUser } from './UserDataSource';

export let dummyProposal: Proposal;
export let dummyProposalView: ProposalView;
export let dummyProposalSubmitted: Proposal;
export let dummyProposalWithNotActiveCall: Proposal;

let allProposals: Proposal[];

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>;
};

const dummyProposalFactory = (values?: Partial<Proposal>) => {
  return new Proposal(
    values?.primaryKey || 1,
    values?.title || 'title',
    values?.abstract || 'abstract',
    values?.proposerId || 1,
    values?.statusId || 1,
    values?.created || new Date(),
    values?.updated || new Date(),
    values?.proposalId || 'shortCode',
    values?.finalStatus || ProposalEndStatus.UNSET,
    values?.callId || 1,
    values?.questionaryId || 1,
    values?.commentForUser || 'comment for user',
    values?.commentForManagement || 'comment for management',
    values?.notified || false,
    values?.submitted || false,
    values?.referenceNumberSequence || 0,
    values?.managementTimeAllocation || 0,
    values?.managementDecisionSubmitted || false
  );
};

export const dummySepMeetingDecision = new SepMeetingDecision(
  1,
  1,
  ProposalEndStatus.ACCEPTED,
  'Dummy comment for user',
  'Dummy comment for management',
  true,
  1
);

const dummyScheduledEventCore = new ScheduledEventCore(
  1,
  ScheduledEventBookingType.USER_OPERATIONS,
  new Date(),
  new Date(),
  1,
  1,
  ProposalBookingStatusCore.ACTIVE,
  1
);

export const dummyProposalTechnicalReview = new TechnicalReview(
  1,
  1,
  'Test comment',
  'Test public comment',
  10,
  TechnicalReviewStatus.FEASIBLE,
  true,
  1,
  '',
  1
);

export class ProposalDataSourceMock implements ProposalDataSource {
  proposalsUpdated: Proposal[];
  constructor() {
    this.init();
  }

  async updateProposalTechnicalReviewer(
    args: UpdateTechnicalReviewAssigneeInput
  ): Promise<TechnicalReview[]> {
    return [dummyProposalTechnicalReview];
  }

  async getProposalsFromView(
    filter?: ProposalsFilter | undefined,
    first?: number | undefined,
    offset?: number | undefined,
    sortField?: string | undefined,
    sortDirection?: string | undefined,
    searchText?: string | undefined
  ): Promise<{ totalCount: number; proposalViews: ProposalView[] }> {
    return { totalCount: 0, proposalViews: [] };
  }
  public init() {
    dummyProposal = dummyProposalFactory({ primaryKey: 1 });
    dummyProposalSubmitted = dummyProposalFactory({
      primaryKey: 2,
      title: 'Submitted proposal',
      submitted: true,
      finalStatus: ProposalEndStatus.ACCEPTED,
      notified: true,
      managementDecisionSubmitted: true,
      statusId: 2,
    });

    dummyProposalWithNotActiveCall = dummyProposalFactory({
      primaryKey: 3,
      questionaryId: 2,
      callId: 2,
    });

    dummyProposalView = new ProposalView(
      1,
      '',
      1,
      '',
      '',
      'shortCode',
      1,
      1,
      false,
      1,
      1,
      1,
      'Carl',
      'Carlsson',
      1,
      false,
      'instrument',
      'call short code',
      'sep code',
      1,
      1,
      1,
      1,
      AllocationTimeUnits.Day,
      1,
      false
    );

    allProposals = [
      dummyProposal,
      dummyProposalSubmitted,
      dummyProposalWithNotActiveCall,
    ];

    this.proposalsUpdated = [];
  }

  async deleteProposal(id: number): Promise<Proposal> {
    const dummyProposalRef = dummyProposalFactory(dummyProposal);
    dummyProposal.primaryKey = -1; // hacky

    return dummyProposalRef;
  }

  async rejectProposal(proposalPk: number): Promise<Proposal> {
    if (dummyProposal.primaryKey !== proposalPk) {
      throw new Error('Wrong ID');
    }

    dummyProposal.finalStatus = ProposalEndStatus.REJECTED; // What is the final status for rejecte?

    return dummyProposal;
  }

  async update(proposal: Proposal): Promise<Proposal> {
    const foundIndex = allProposals.findIndex(
      ({ primaryKey: id }) => proposal.primaryKey === id
    );

    if (foundIndex === -1) {
      throw new Error('Proposal does not exist');
    }

    this.proposalsUpdated.push(proposal);

    return proposal;
  }

  async updateProposalStatus(
    proposalPk: number,
    proposalStatusId: number
  ): Promise<Proposal> {
    const proposal = await this.get(proposalPk);

    if (!proposal) {
      throw new Error('Proposal does not exist');
    }
    proposal.statusId = proposalStatusId;

    return proposal;
  }

  async setProposalUsers(proposalPk: number, users: number[]): Promise<void> {
    throw new Error('Not implemented');
  }

  async submitProposal(
    primaryKey: number,
    referenceNumber?: string
  ): Promise<Proposal> {
    const found = allProposals.find(
      (proposal) => proposal.primaryKey === primaryKey
    );

    if (!found) {
      throw new Error('Wrong ID');
    }

    const newObj = { ...found, submitted: true };

    if (referenceNumber !== undefined) {
      newObj.proposalId = referenceNumber;
    }

    Object.setPrototypeOf(newObj, Proposal.prototype);

    return newObj;
  }

  async get(id: number) {
    return allProposals.find((proposal) => proposal.primaryKey === id) || null;
  }

  async create(proposerId: number, callId: number, questionaryId: number) {
    const newProposal = dummyProposalFactory({
      proposerId,
      callId,
      questionaryId,
    });
    allProposals.push(newProposal);

    return newProposal;
  }

  async getProposals(
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; proposals: Proposal[] }> {
    return { totalCount: allProposals.length, proposals: allProposals };
  }

  async getUserProposals(id: number) {
    return allProposals.filter((proposal) => proposal.proposerId === id);
  }

  async getInstrumentScientistProposals(
    scientistId: number,
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ) {
    return { totalCount: 1, proposals: [dummyProposalView] };
  }

  async markEventAsDoneOnProposal(
    event: Event,
    proposalPk: number
  ): Promise<ProposalEventsRecord | null> {
    return {
      proposal_pk: 1,
      proposal_created: true,
      proposal_submitted: true,
      proposal_feasible: true,
      proposal_unfeasible: false,
      call_ended: false,
      call_review_ended: false,
      proposal_sep_selected: false,
      proposal_instrument_selected: false,
      proposal_feasibility_review_submitted: false,
      proposal_sample_review_submitted: false,
      proposal_all_sep_reviews_submitted: false,
      proposal_feasibility_review_updated: false,
      proposal_management_decision_submitted: false,
      proposal_management_decision_updated: false,
      proposal_sample_safe: false,
      proposal_sep_review_updated: false,
      proposal_all_sep_reviewers_selected: false,
      proposal_sep_review_submitted: false,
      proposal_sep_meeting_submitted: false,
      proposal_instrument_submitted: false,
      proposal_accepted: false,
      proposal_reserved: false,
      proposal_rejected: false,
      proposal_notified: false,
    };
  }

  async getCount(callId: number): Promise<number> {
    return 1;
  }

  async cloneProposal(proposal: Proposal, call: Call): Promise<Proposal> {
    return dummyProposal;
  }

  async resetProposalEvents(
    proposalPk: number,
    callId: number,
    statusId: number
  ): Promise<boolean> {
    return true;
  }

  async changeProposalsStatus(
    statusId: number,
    proposalPks: number[]
  ): Promise<ProposalPksWithNextStatus> {
    return { proposalPks: [1] };
  }

  async getProposalBookingByProposalPk(
    proposalPk: number,
    filter?: ProposalBookingFilter
  ): Promise<{ id: number } | null> {
    return { id: 1 };
  }

  async proposalBookingScheduledEvents(
    proposalBookingId: number,
    filter?: ProposalBookingScheduledEventFilterCore
  ): Promise<ScheduledEventCore[] | null> {
    return [dummyScheduledEventCore];
  }

  async addProposalBookingScheduledEvent(
    eventMessage: ScheduledEventCore
  ): Promise<void> {
    return;
  }

  async removeProposalBookingScheduledEvents(
    eventMessage: ScheduledEventCore[]
  ): Promise<void> {
    return;
  }

  async updateProposalBookingScheduledEvent(
    eventMessage: ScheduledEventCore
  ): Promise<void> {
    return;
  }

  async getRelatedUsersOnProposals(id: number): Promise<number[]> {
    return [basicDummyUser.id];
  }
}

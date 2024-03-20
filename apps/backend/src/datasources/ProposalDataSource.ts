import { Event } from '../events/event.enum';
import { Call } from '../models/Call';
import { Proposal, Proposals } from '../models/Proposal';
import { ProposalView } from '../models/ProposalView';
import { ScheduledEventCore } from '../models/ScheduledEventCore';
import { TechnicalReview } from '../models/TechnicalReview';
import { UserWithRole } from '../models/User';
import { UpdateTechnicalReviewAssigneeInput } from '../resolvers/mutations/UpdateTechnicalReviewAssigneeMutation';
import {
  ProposalBookingFilter,
  ProposalBookingScheduledEventFilterCore,
} from '../resolvers/types/ProposalBooking';
import { UserProposalsFilter } from '../resolvers/types/User';
import { ProposalsFilter } from './../resolvers/queries/ProposalsQuery';
import { ProposalEventsRecord } from './postgres/records';

export interface ProposalDataSource {
  getProposalsFromView(
    filter?: ProposalsFilter,
    first?: number,
    offset?: number,
    sortField?: string,
    sortDirection?: string,
    searchText?: string
  ): Promise<{ totalCount: number; proposalViews: ProposalView[] }>;
  // Read
  get(primaryKey: number): Promise<Proposal | null>;
  getByQuestionaryId(questionaryId: number): Promise<Proposal | null>;
  getProposals(
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; proposals: Proposal[] }>;
  getInstrumentScientistProposals(
    scientistId: UserWithRole,
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; proposals: ProposalView[] }>;
  getUserProposals(
    id: number,
    filter?: UserProposalsFilter
  ): Promise<Proposal[]>;
  getProposalsByPks(pks: number[]): Promise<Proposal[]>;
  // Write
  create(
    proposer_id: number,
    call_id: number,
    questionary_id: number
  ): Promise<Proposal>;
  update(proposal: Proposal): Promise<Proposal>;
  updateProposalStatus(
    proposalPk: number,
    proposalStatusId: number
  ): Promise<Proposal>;
  updateProposalTechnicalReviewer(
    args: UpdateTechnicalReviewAssigneeInput
  ): Promise<TechnicalReview[]>;
  setProposalUsers(proposalPk: number, users: number[]): Promise<void>;
  submitProposal(
    primaryKey: number,
    referenceNumber?: string
  ): Promise<Proposal>;
  deleteProposal(primaryKey: number): Promise<Proposal>;
  markEventAsDoneOnProposals(
    event: Event,
    proposalPk: number[]
  ): Promise<ProposalEventsRecord[] | null>;
  getCount(callId: number): Promise<number>;
  cloneProposal(sourceProposal: Proposal, call: Call): Promise<Proposal>;
  resetProposalEvents(
    proposalPk: number,
    callId: number,
    statusId: number
  ): Promise<boolean>;
  getProposalEvents(proposalPk: number): Promise<ProposalEventsRecord | null>;
  changeProposalsStatus(
    statusId: number,
    proposalPks: number[]
  ): Promise<Proposals>;
  getProposalBookingsByProposalPk(
    proposalPk: number,
    filter?: ProposalBookingFilter
  ): Promise<{ ids: number[] } | null>;
  getAllProposalBookingsScheduledEvents(
    proposalBookingIds: number[],
    filter?: ProposalBookingScheduledEventFilterCore
  ): Promise<ScheduledEventCore[] | null>;
  addProposalBookingScheduledEvent(
    eventMessage: ScheduledEventCore
  ): Promise<void>;
  removeProposalBookingScheduledEvents(
    eventMessage: ScheduledEventCore[]
  ): Promise<void>;
  updateProposalBookingScheduledEvent(
    eventMessage: ScheduledEventCore
  ): Promise<void>;
  getRelatedUsersOnProposals(id: number): Promise<number[]>;
  getProposalById(proposalId: string): Promise<Proposal | null>;
}

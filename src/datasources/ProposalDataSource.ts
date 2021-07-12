import { Event } from '../events/event.enum';
import { Call } from '../models/Call';
import { Proposal, ProposalPksWithNextStatus } from '../models/Proposal';
import { ProposalView } from '../models/ProposalView';
import { UpdateTechnicalReviewAssigneeInput } from '../resolvers/mutations/UpdateTechnicalReviewAssignee';
import { UserProposalsFilter } from '../resolvers/types/User';
import { ProposalsFilter } from './../resolvers/queries/ProposalsQuery';
import { ProposalEventsRecord } from './postgres/records';

export interface ProposalDataSource {
  getProposalsFromView(filter?: ProposalsFilter): Promise<ProposalView[]>;
  // Read
  get(primaryKey: number): Promise<Proposal | null>;

  getProposals(
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; proposals: Proposal[] }>;
  getInstrumentScientistProposals(
    scientistId: number,
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; proposals: Proposal[] }>;
  getUserProposals(
    id: number,
    filter?: UserProposalsFilter
  ): Promise<Proposal[]>;

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
  ): Promise<Proposal[]>;
  setProposalUsers(proposalPk: number, users: number[]): Promise<void>;
  submitProposal(primaryKey: number): Promise<Proposal>;
  deleteProposal(primaryKey: number): Promise<Proposal>;
  markEventAsDoneOnProposal(
    event: Event,
    proposalPk: number
  ): Promise<ProposalEventsRecord | null>;
  getCount(callId: number): Promise<number>;
  cloneProposal(sourceProposal: Proposal, call: Call): Promise<Proposal>;
  resetProposalEvents(
    proposalPk: number,
    callId: number,
    statusId: number
  ): Promise<boolean>;
  changeProposalsStatus(
    statusId: number,
    proposalPks: number[]
  ): Promise<ProposalPksWithNextStatus>;
}

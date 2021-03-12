import { Event } from '../events/event.enum';
import { Proposal } from '../models/Proposal';
import { ProposalView } from '../models/ProposalView';
import { ProposalsFilter } from './../resolvers/queries/ProposalsQuery';
import { ProposalEventsRecord } from './postgres/records';

export interface ProposalDataSource {
  getProposalsFromView(filter?: ProposalsFilter): Promise<ProposalView[]>;
  // Read
  get(id: number): Promise<Proposal | null>;
  checkActiveCall(callId: number): Promise<boolean>;
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
  getUserProposals(id: number): Promise<Proposal[]>;

  // Write
  create(
    proposer_id: number,
    call_id: number,
    questionary_id: number
  ): Promise<Proposal>;
  update(proposal: Proposal): Promise<Proposal>;
  updateProposalStatus(
    proposalId: number,
    proposalStatusId: number
  ): Promise<Proposal>;
  setProposalUsers(id: number, users: number[]): Promise<void>;
  submitProposal(id: number): Promise<Proposal>;
  deleteProposal(id: number): Promise<Proposal>;
  markEventAsDoneOnProposal(
    event: Event,
    proposalId: number
  ): Promise<ProposalEventsRecord | null>;
  getCount(callId: number): Promise<number>;
  cloneProposal(
    clonerId: number,
    proposalId: number,
    callId: number,
    templateId: number
  ): Promise<Proposal>;
  resetProposalEvents(
    proposalId: number,
    callId: number,
    statusId: number
  ): Promise<boolean>;
}

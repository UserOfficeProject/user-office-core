/* eslint-disable @typescript-eslint/camelcase */
import {
  Instrument,
  InstrumentHasProposals,
  InstrumentWithAvailabilityTime,
} from '../models/Instrument';
import { ProposalIdsWithNextStatus } from '../models/Proposal';
import { BasicUserDetails } from '../models/User';
import { CreateInstrumentArgs } from '../resolvers/mutations/CreateInstrumentMutation';

export interface InstrumentDataSource {
  create(args: CreateInstrumentArgs): Promise<Instrument>;
  get(instrumentId: number): Promise<Instrument | null>;
  getAll(
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; instruments: Instrument[] }>;
  getUserInstruments(userId: number): Promise<Instrument[]>;
  getInstrumentsByCallId(
    callIds: number[]
  ): Promise<InstrumentWithAvailabilityTime[]>;
  getCallsByInstrumentId(
    instrumentId: number,
    callIds: number[]
  ): Promise<{ callId: number; instrumentId: number }[]>;
  update(instrument: Instrument): Promise<Instrument>;
  delete(instrumentId: number): Promise<Instrument>;
  assignProposalsToInstrument(
    proposalIds: number[],
    instrumentId: number
  ): Promise<ProposalIdsWithNextStatus>;
  removeProposalFromInstrument(
    proposalId: number,
    instrumentId: number
  ): Promise<boolean>;
  assignScientistsToInstrument(
    scientistIds: number[],
    instrumentId: number
  ): Promise<boolean>;
  removeScientistFromInstrument(
    scientistId: number,
    instrumentId: number
  ): Promise<boolean>;
  getInstrumentScientists(instrumentId: number): Promise<BasicUserDetails[]>;
  getInstrumentByProposalId(proposalId: number): Promise<Instrument | null>;
  getInstrumentsBySepId(
    sepId: number,
    callId: number
  ): Promise<InstrumentWithAvailabilityTime[]>;
  setAvailabilityTimeOnInstrument(
    callId: number,
    instrumentId: number,
    availabilityTime: number
  ): Promise<boolean>;
  submitInstrument(
    proposalIds: number[],
    instrumentId: number
  ): Promise<InstrumentHasProposals>;
  hasInstrumentScientistInstrument(
    userId: number,
    instrumentId: number
  ): Promise<boolean>;
  hasInstrumentScientistAccess(
    userId: number,
    instrumentId: number,
    proposalId: number
  ): Promise<boolean>;
  isProposalInstrumentSubmitted(proposalId: number): Promise<boolean>;
}

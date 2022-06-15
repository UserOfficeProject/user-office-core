import {
  Instrument,
  InstrumentHasProposals,
  InstrumentWithAvailabilityTime,
} from '../models/Instrument';
import { ProposalPksWithNextStatus } from '../models/Proposal';
import { BasicUserDetails } from '../models/User';
import { CreateInstrumentArgs } from '../resolvers/mutations/CreateInstrumentMutation';

export interface InstrumentDataSource {
  create(args: CreateInstrumentArgs): Promise<Instrument>;
  getInstrument(instrumentId: number): Promise<Instrument | null>;
  getInstrumentsByNames(instrumentNames: string[]): Promise<Instrument[]>;
  getInstruments(
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
    proposalPks: number[],
    instrumentId: number
  ): Promise<ProposalPksWithNextStatus>;
  removeProposalsFromInstrument(proposalPks: number[]): Promise<boolean>;
  assignScientistsToInstrument(
    scientistIds: number[],
    instrumentId: number
  ): Promise<boolean>;
  removeScientistFromInstrument(
    scientistId: number,
    instrumentId: number
  ): Promise<boolean>;
  assignScientistToInstruments(
    scientistId: number,
    instrumentIds: number[]
  ): Promise<boolean>;
  removeScientistFromInstruments(
    scientistId: number,
    instrumentIds: number[]
  ): Promise<boolean>;
  getInstrumentScientists(instrumentId: number): Promise<BasicUserDetails[]>;
  getInstrumentByProposalPk(proposalPk: number): Promise<Instrument | null>;
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
    proposalPks: number[],
    instrumentId: number
  ): Promise<InstrumentHasProposals>;
  hasInstrumentScientistInstrument(
    userId: number,
    instrumentId: number
  ): Promise<boolean>;
  hasInstrumentScientistAccess(
    userId: number,
    instrumentId: number,
    proposalPk: number
  ): Promise<boolean>;
  isProposalInstrumentSubmitted(proposalPk: number): Promise<boolean>;
}

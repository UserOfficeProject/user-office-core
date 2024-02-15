import {
  Instrument,
  InstrumentHasProposals,
  InstrumentWithAvailabilityTime,
  InstrumentWithManagementTime,
} from '../models/Instrument';
import { BasicUserDetails } from '../models/User';
import { ManagementTimeAllocationsInput } from '../resolvers/mutations/AdministrationProposalMutation';
import { CreateInstrumentArgs } from '../resolvers/mutations/CreateInstrumentMutation';

export interface InstrumentDataSource {
  create(args: CreateInstrumentArgs): Promise<Instrument>;
  getInstrument(instrumentId: number): Promise<Instrument | null>;
  getInstrumentsByNames(instrumentNames: string[]): Promise<Instrument[]>;
  getInstrumentsByIds(instrumentIds: number[]): Promise<Instrument[]>;
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
  assignProposalToInstrument(
    proposalPk: number,
    instrumentId: number
  ): Promise<InstrumentHasProposals>;
  removeProposalsFromInstrument(
    proposalPks: number[],
    instrumentId?: number
  ): Promise<boolean>;
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
  getInstrumentsByProposalPk(
    proposalPk: number
  ): Promise<InstrumentWithManagementTime[]>;
  updateProposalInstrumentTimeAllocation(
    proposalPk: number,
    managementTimeAllocations: ManagementTimeAllocationsInput[]
  ): Promise<boolean>;
  getInstrumentsByFapId(
    fapId: number,
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

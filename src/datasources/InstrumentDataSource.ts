/* eslint-disable @typescript-eslint/camelcase */
import {
  Instrument,
  InstrumentWithAvailabilityTime,
} from '../models/Instrument';
import { BasicUserDetails } from '../models/User';
import { CreateInstrumentArgs } from '../resolvers/mutations/CreateInstrumentMutation';

export interface InstrumentDataSource {
  create(args: CreateInstrumentArgs): Promise<Instrument>;
  get(instrumentId: number): Promise<Instrument | null>;
  getAll(
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; instruments: Instrument[] }>;
  getInstrumentsByCallId(
    callId: number
  ): Promise<InstrumentWithAvailabilityTime[]>;
  update(instrument: Instrument): Promise<Instrument>;
  delete(instrumentId: number): Promise<Instrument>;
  assignProposalsToInstrument(
    proposalIds: number[],
    instrumentId: number
  ): Promise<boolean>;
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
  getInstrumentsBySepId(sepId: number): Promise<Instrument[]>;
  setAvailabilityTimeOnInstrument(
    callId: number,
    instrumentId: number,
    availabilityTime: number
  ): Promise<boolean>;
}

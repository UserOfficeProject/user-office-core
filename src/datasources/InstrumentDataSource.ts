/* eslint-disable @typescript-eslint/camelcase */
import { Instrument } from '../models/Instrument';
import { CreateInstrumentArgs } from '../resolvers/mutations/CreateInstrumentMutation';

export interface InstrumentDataSource {
  create(args: CreateInstrumentArgs): Promise<Instrument>;
  get(instrumentId: number): Promise<Instrument | null>;
  getAll(
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; instruments: Instrument[] }>;
  getInstrumentsByCallId(callId: number): Promise<Instrument[]>;
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
  getInstrumentByProposalId(proposalId: number): Promise<Instrument | null>;
}

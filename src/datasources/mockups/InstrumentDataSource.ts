import {
  Instrument,
  InstrumentWithAvailabilityTime,
} from '../../models/Instrument';
import { BasicUserDetails } from '../../models/User';
import { CreateInstrumentArgs } from '../../resolvers/mutations/CreateInstrumentMutation';
import { InstrumentDataSource } from '../InstrumentDataSource';
import { basicDummyUser } from './UserDataSource';

export const dummyInstrument = new Instrument(
  1,
  'Dummy instrument 1',
  'instrument_1',
  'This is test instrument.'
);

export const dummyInstrumentWithAvailabilityTime = new InstrumentWithAvailabilityTime(
  1,
  'Dummy instrument 1',
  'instrument_1',
  'This is test instrument.',
  10,
  false
);

const dummyInstruments = [dummyInstrument];

export class InstrumentDataSourceMock implements InstrumentDataSource {
  async create(args: CreateInstrumentArgs): Promise<Instrument> {
    return { ...dummyInstrument, ...args };
  }

  async get(instrumentId: number): Promise<Instrument | null> {
    const instrument = dummyInstruments.find(
      dummyInstrumentItem => dummyInstrumentItem.id === instrumentId
    );

    if (instrument) {
      return instrument;
    } else {
      return null;
    }
  }

  async getAll(
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; instruments: Instrument[] }> {
    return { totalCount: 1, instruments: [dummyInstrument] };
  }

  async update(instrument: Instrument): Promise<Instrument> {
    return { ...dummyInstrument, ...instrument };
  }

  async delete(instrumentId: number): Promise<Instrument> {
    return dummyInstrument;
  }

  async getUserInstruments(userId: number): Promise<Instrument[]> {
    return [dummyInstrument];
  }

  async getInstrumentsByCallId(
    callIds: number[]
  ): Promise<InstrumentWithAvailabilityTime[]> {
    return [dummyInstrumentWithAvailabilityTime];
  }

  async getCallsByInstrumentId(instrumentId: number, callIds: number[]) {
    return [{ callId: 1, instrumentId: 1 }];
  }

  async assignProposalsToInstrument(
    proposalIds: number[],
    instrumentId: number
  ): Promise<boolean> {
    return true;
  }

  async removeProposalFromInstrument(
    proposalId: number,
    instrumentId: number
  ): Promise<boolean> {
    return true;
  }

  async getInstrumentByProposalId(
    proposalId: number
  ): Promise<Instrument | null> {
    return dummyInstrument;
  }

  async getInstrumentsBySepId(
    sepId: number,
    callId: number
  ): Promise<InstrumentWithAvailabilityTime[]> {
    return [dummyInstrumentWithAvailabilityTime];
  }

  async assignScientistsToInstrument(
    scientistIds: number[],
    instrumentId: number
  ): Promise<boolean> {
    return true;
  }

  async removeScientistFromInstrument(
    scientistId: number,
    instrumentId: number
  ): Promise<boolean> {
    return true;
  }

  async getInstrumentScientists(): Promise<BasicUserDetails[]> {
    return [basicDummyUser];
  }

  async setAvailabilityTimeOnInstrument(
    callId: number,
    instrumentId: number,
    availabilityTime: number
  ): Promise<boolean> {
    return true;
  }

  async submitInstrument(
    callId: number,
    instrumentId: number
  ): Promise<boolean> {
    return true;
  }

  hasInstrumentScientistInstrument(
    userId: number,
    instrumentId: number
  ): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  hasInstrumentScientistAccess(
    userId: number,
    instrumentId: number,
    proposalId: number
  ): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}

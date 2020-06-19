import { Instrument } from '../../models/Instrument';
import { CreateInstrumentArgs } from '../../resolvers/mutations/CreateInstrumentMutation';
import { InstrumentDataSource } from '../InstrumentDataSource';

export const dummyInstrument = new Instrument(
  1,
  'Dummy instrument 1',
  'instrument_1',
  'This is test instrument.'
);

const dummyInstruments = [dummyInstrument];

export class InstrumentDataSourceMock implements InstrumentDataSource {
  async create(args: CreateInstrumentArgs): Promise<Instrument> {
    return { ...dummyInstrument, ...args };
  }

  async get(instrumentId: number): Promise<Instrument | null> {
    const instrument = dummyInstruments.find(
      dummyInstrumentItem => dummyInstrumentItem.instrumentId === instrumentId
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

  async getInstrumentsByCallId(callId: number): Promise<Instrument[]> {
    return [dummyInstrument];
  }
}

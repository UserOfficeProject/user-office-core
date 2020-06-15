/* eslint-disable @typescript-eslint/camelcase */
import { Instrument } from '../models/Instrument';
import { CreateInstrumentArgs } from '../resolvers/mutations/CreateInstrumentMutation';

export interface InstrumentDataSource {
  create(args: CreateInstrumentArgs): Promise<Instrument>;
  get(id: number): Promise<Instrument | null>;
  getAll(
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; instruments: Instrument[] }>;
  update(instrument: Instrument): Promise<Instrument>;
  delete(id: number): Promise<Instrument>;
}

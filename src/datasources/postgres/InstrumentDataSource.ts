/* eslint-disable @typescript-eslint/camelcase */
import { Instrument } from '../../models/Instrument';
import { CreateInstrumentArgs } from '../../resolvers/mutations/CreateInstrumentMutation';
import { InstrumentDataSource } from '../InstrumentDataSource';
import database from './database';
import { InstrumentRecord } from './records';

export default class PostgresInstrumentDataSource
  implements InstrumentDataSource {
  private createInstrumentObject(instrument: InstrumentRecord) {
    return new Instrument(
      instrument.instrument_id,
      instrument.name,
      instrument.short_code,
      instrument.description
    );
  }

  async create(args: CreateInstrumentArgs): Promise<Instrument> {
    return database
      .insert(args)
      .into('instruments')
      .returning(['*'])
      .then((instrument: InstrumentRecord[]) => {
        if (instrument.length !== 1) {
          throw new Error('Could not create instrument');
        }

        return this.createInstrumentObject(instrument[0]);
      });
  }

  async get(id: number): Promise<Instrument | null> {
    return database
      .select()
      .from('instruments')
      .where('instrument_id', id)
      .first()
      .then((instrument: InstrumentRecord | null) =>
        instrument ? this.createInstrumentObject(instrument) : null
      );
  }

  async getAll(
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; instruments: Instrument[] }> {
    return database
      .select(['*', database.raw('count(*) OVER() AS full_count')])
      .from('instruments')
      .orderBy('instrument_id', 'desc')
      .modify(query => {
        if (first) {
          query.limit(first);
        }
        if (offset) {
          query.offset(offset);
        }
      })
      .then((instruments: InstrumentRecord[]) => {
        const result = instruments.map(instrument =>
          this.createInstrumentObject(instrument)
        );

        return {
          totalCount: instruments[0] ? instruments[0].full_count : 0,
          instruments: result,
        };
      });
  }

  async update(instrument: Instrument): Promise<Instrument> {
    return database
      .update(instrument, ['*'])
      .from('instruments')
      .where('instrument_id', instrument.instrumentId)
      .then((records: InstrumentRecord[]) => {
        if (records === undefined || !records.length) {
          throw new Error(`Instrument not found ${instrument.instrumentId}`);
        }

        return this.createInstrumentObject(records[0]);
      });
  }

  async delete(id: number): Promise<Instrument> {
    return database('instruments')
      .where('instruments.instrument_id', id)
      .del()
      .from('instruments')
      .returning('*')
      .then((instrument: InstrumentRecord[]) => {
        if (instrument === undefined || instrument.length !== 1) {
          throw new Error(`Could not delete instrument with id: ${id} `);
        }

        return this.createInstrumentObject(instrument[0]);
      });
  }
}

import { Call } from '../../models/Call';
import PostgresCallDataSource from '../postgres/CallDataSource';
import database from '../postgres/database';
import { CallRecord, createCallObject } from '../postgres/records';

export class StfcCallDataSource extends PostgresCallDataSource {
  async getCallsByInstrumentScientist(scientistId: number): Promise<Call[]> {
    const records: CallRecord[] = await database('call').distinct(['call.*']);

    return records.map(createCallObject);
  }
}

/* eslint-disable @typescript-eslint/camelcase */
import { SampleDataSource } from '../SampleDataSource';
import { Sample } from '../../models/Sample';
import database from './database';
import { createSampleObject, SampleRecord } from './records';
import { SamplesArgs } from '../../resolvers/queries/SamplesQuery';

export default class PostgresSampleDataSource implements SampleDataSource {
  getSamples(args: SamplesArgs): Promise<Sample[]> {
    return database('samples')
      .select('*')
      .then((records: SampleRecord[]) => {
        return records.map(record => createSampleObject(record)) || [];
      });
  }
}

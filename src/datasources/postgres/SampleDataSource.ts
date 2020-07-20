/* eslint-disable @typescript-eslint/camelcase */
import { SampleDataSource } from '../SampleDataSource';
import { Sample } from '../../models/Sample';
import database from './database';
import { createSampleObject, SampleRecord } from './records';
import { SamplesArgs } from '../../resolvers/queries/SamplesQuery';

export default class PostgresSampleDataSource implements SampleDataSource {
  getSamplesByCallId(callId: number): Promise<Sample[]> {
    return database('samples_extended_view')
      .select('*')
      .where('call_id', callId)
      .then((records: SampleRecord[]) => {
        return records.map(record => createSampleObject(record)) || [];
      });
  }
  getSamplesByAnswerId(answerId: number): Promise<Sample[]> {
    const subQuery = database('answer_has_questionaries')
      .where('answer_id', answerId)
      .select('questionary_id');

    return database('samples')
      .where('questionary_id', 'in', subQuery)
      .select('*')
      .then((records: SampleRecord[]) => {
        return records.map(record => createSampleObject(record)) || [];
      });
  }
  getSamples(args: SamplesArgs): Promise<Sample[]> {
    const filter = args.filter;
    return database('samples').modify(query => {
      if (filter?.creatorId) {
        query.where('creator_id', filter?.creatorId);
      }
      if (filter?.status) {
        query.where('creator_id', filter?.status);
      }
      if (filter?.questionaryId) {
        query.where('questionary_id', filter?.questionaryId);
      }
      if (filter?.title) {
        query.where('title', 'like', `%${filter.title}%`);
      }
      query.select('*').then((records: SampleRecord[]) => {
        return records.map(record => createSampleObject(record)) || [];
      });
    });
  }
}

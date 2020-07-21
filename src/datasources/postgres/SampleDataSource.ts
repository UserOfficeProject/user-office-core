/* eslint-disable @typescript-eslint/camelcase */
import { SampleDataSource } from '../SampleDataSource';
import { Sample } from '../../models/Sample';
import database from './database';
import { createSampleObject, SampleRecord } from './records';
import { SamplesArgs } from '../../resolvers/queries/SamplesQuery';
import { CreateSampleArgs } from '../../resolvers/mutations/CreateSampleMutations';
import { image } from 'pdfkit/js/mixins/images';

export default class PostgresSampleDataSource implements SampleDataSource {
  create(
    questionary_id: number,
    title: string,
    creator_id: number
  ): Promise<Sample> {
    return database('samples')
      .insert({ title, questionary_id, creator_id }, '*')
      .then((records: SampleRecord[]) => {
        if (records.length !== 1) {
          throw new Error('Failed to insert sample');
        }
        return createSampleObject(records[0]);
      });
  }
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

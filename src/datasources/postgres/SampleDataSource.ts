/* eslint-disable @typescript-eslint/camelcase */
import { Sample, SampleStatus } from '../../models/Sample';
import { UpdateSampleSafetyReviewArgs } from '../../resolvers/mutations/UpdateSampleSafetyReviewMutation';
import { UpdateSampleStatusArgs } from '../../resolvers/mutations/UpdateSampleStatusMutation';
import { UpdateSampleTitleArgs } from '../../resolvers/mutations/UpdateSampleTitleMutation';
import { SamplesArgs } from '../../resolvers/queries/SamplesQuery';
import { logger } from '../../utils/Logger';
import { SampleDataSource } from '../SampleDataSource';
import database from './database';
import { createSampleObject, SampleRecord } from './records';

export default class PostgresSampleDataSource implements SampleDataSource {
  delete(sampleId: number): Promise<Sample> {
    return database('samples')
      .where({ sample_id: sampleId })
      .delete('*')
      .then((records: SampleRecord[]) => {
        if (records.length !== 1) {
          logger.logError('Could not delete sample', { sampleId });
          throw new Error('Could not delete sample');
        }

        return createSampleObject(records[0]);
      });
  }

  updateSampleStatus(args: UpdateSampleStatusArgs): Promise<Sample> {
    return database('samples')
      .update({ status: args.status }, '*')
      .where({ sample_id: args.sampleId })
      .then((records: SampleRecord[]) => {
        if (records.length !== 1) {
          logger.logError('Could not update sample status', { args });
          throw new Error('Could not update sample status');
        }

        return createSampleObject(records[0]);
      });
  }

  updateSampleTitle(args: UpdateSampleTitleArgs): Promise<Sample> {
    return database('samples')
      .update({ title: args.title }, '*')
      .where({ sample_id: args.sampleId })
      .then((records: SampleRecord[]) => {
        if (records.length !== 1) {
          logger.logError('Could not update sample title', { args });
          throw new Error('Could not update sample title');
        }

        return createSampleObject(records[0]);
      });
  }

  updateSampleSafetyReview(args: UpdateSampleSafetyReviewArgs) {
    return database('samples')
      .update(
        {
          safety_comment: args.safetyComment,
          safety_status: args.safetyStatus,
        },
        '*'
      )
      .where({ sample_id: args.id })
      .then((records: SampleRecord[]) => {
        if (records.length !== 1) {
          logger.logError('Could not update sample safety review', { args });
          throw new Error('Could not update sample safety review');
        }

        return createSampleObject(records[0]);
      });
  }

  updateSample(args: Partial<Sample> & Pick<Sample, 'id'>): Promise<Sample> {
    return database('samples')
      .update(
        {
          title: args.title,
          safety_comment: args.safetyComment,
          safety_status: args.safetyStatus,
        },
        '*'
      )
      .where({ sample_id: args.id })
      .then((records: SampleRecord[]) => {
        if (records.length !== 1) {
          logger.logError('Could not update sample title', { args });
          throw new Error('Could not update sample title');
        }

        return createSampleObject(records[0]);
      });
  }

  create(
    questionary_id: number,
    title: string,
    creator_id: number
  ): Promise<Sample> {
    return database('samples')
      .insert({ title, questionary_id, creator_id }, '*')
      .then((records: SampleRecord[]) => {
        if (records.length !== 1) {
          logger.logError('Could not create sample', {
            questionary_id,
            title,
            creator_id,
          });
          throw new Error('Failed to insert sample');
        }

        return createSampleObject(records[0]);
      });
  }

  getSample(sampleId: number): Promise<Sample> {
    return database('samples')
      .select('*')
      .where('sample_id', sampleId)
      .then((records: SampleRecord[]) => {
        if (records.length !== 1) {
          logger.logError('Sample does not exist', { sampleId });
        }

        return createSampleObject(records[0]);
      });
  }

  getSamplesByCallId(callId: number): Promise<Sample[]> {
    return database('answer_has_questionaries')
      .leftJoin(
        'answers',
        'answer_has_questionaries.answer_id',
        'answers.answer_id'
      )
      .leftJoin(
        'proposals',
        'answers.questionary_id',
        'proposals.questionary_id'
      )
      .leftJoin(
        'samples',
        'samples.questionary_id',
        'answer_has_questionaries.questionary_id'
      )
      .select('samples.*')
      .where(' proposals.call_id', callId)
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
  async getSamples(args: SamplesArgs): Promise<Sample[]> {
    const filter = args.filter;

    return database('samples')
      .modify(query => {
        if (filter?.creatorId) {
          query.where('creator_id', filter.creatorId);
        }
        if (filter?.status) {
          query.where('creator_id', filter.status);
        }
        if (filter?.questionaryId) {
          query.where('questionary_id', filter.questionaryId);
        }
        if (filter?.title) {
          query.where('title', 'like', `%${filter.title}%`);
        }
        if (filter?.sampleIds) {
          query.where('sample_id', 'in', filter.sampleIds);
        }
      })
      .select('*')
      .then((records: SampleRecord[]) =>
        records.map(record => createSampleObject(record))
      );
  }
}

import { logger } from '@user-office-software/duo-logger';
import { injectable } from 'tsyringe';

import { Sample } from '../../models/Sample';
import { UpdateSampleArgs } from '../../resolvers/mutations/UpdateSampleMutation';
import { SamplesArgs } from '../../resolvers/queries/SamplesQuery';
import { SampleDataSource } from '../SampleDataSource';
import database from './database';
import { createSampleObject, SampleRecord } from './records';

@injectable()
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

  updateSample(args: UpdateSampleArgs): Promise<Sample> {
    return database('samples')
      .update(
        {
          title: args.title,
          safety_comment: args.safetyComment,
          safety_status: args.safetyStatus,
          proposal_pk: args.proposalPk,
          questionary_id: args.questionaryId,
          shipment_id: args.shipmentId,
          is_post_proposal_submission: args.isPostProposalSubmission,
        },
        '*'
      )
      .where({ sample_id: args.sampleId })
      .then((records: SampleRecord[]) => {
        if (records.length !== 1) {
          logger.logError('Could not update sample', { args });
          throw new Error('Could not update sample');
        }

        return createSampleObject(records[0]);
      });
  }

  create(
    title: string,
    creator_id: number,
    proposal_pk: number,
    questionary_id: number,
    question_id: string
  ): Promise<Sample> {
    return database('samples')
      .insert(
        {
          title,
          creator_id,
          proposal_pk,
          questionary_id,
          question_id,
        },
        '*'
      )
      .then((records: SampleRecord[]) => {
        if (records.length !== 1) {
          logger.logError('Could not create sample', {
            title,
            creator_id,
            proposal_pk,
            questionary_id,
          });
          throw new Error('Failed to insert sample');
        }

        return createSampleObject(records[0]);
      });
  }

  getSample(sampleId: number): Promise<Sample | null> {
    return database('samples')
      .select('*')
      .where('sample_id', sampleId)
      .first()
      .then((sample?: SampleRecord) => {
        if (!sample) {
          logger.logError('Sample does not exist', { sampleId });
        }

        return sample ? createSampleObject(sample) : null;
      });
  }

  getSamplesByCallId(callId: number): Promise<Sample[]> {
    return database('proposals')
      .join('samples', 'proposals.proposal_pk', 'samples.proposal_pk')
      .select('samples.*')
      .where(' proposals.call_id', callId)
      .then((records: SampleRecord[]) => {
        return records.map((record) => createSampleObject(record)) || [];
      });
  }

  async getSamples(args: SamplesArgs): Promise<Sample[]> {
    const filter = args.filter;

    return database('samples')
      .modify((query) => {
        if (filter?.creatorId) {
          query.where('creator_id', filter.creatorId);
        }
        if (filter?.status) {
          query.where('creator_id', filter.status);
        }
        if (filter?.questionaryIds) {
          query.where('questionary_id', 'in', filter.questionaryIds);
        }
        if (filter?.title) {
          query.where('title', 'like', `%${filter.title}%`);
        }
        if (filter?.sampleIds) {
          query.where('sample_id', 'in', filter.sampleIds);
        }
        if (filter?.proposalPk) {
          query.where('proposal_pk', filter.proposalPk);
        }
        if (filter?.questionId) {
          query.where('question_id', filter.questionId);
        }
      })
      .select('*')
      .orderBy('created_at', 'asc')
      .then((records: SampleRecord[]) =>
        records.map((record) => createSampleObject(record))
      );
  }

  getSamplesByShipmentId(shipmentId: number): Promise<Sample[]> {
    return database('shipments_has_samples')
      .leftJoin(
        'samples',
        'shipments_has_samples.sample_id',
        'samples.sample_id'
      )
      .select('samples.*')
      .where(' shipments_has_samples.shipment_id', shipmentId)
      .then((records: SampleRecord[]) => {
        return records.map((record) => createSampleObject(record)) || [];
      });
  }

  getSamplesByEsiId(esiId: number): Promise<Sample[]> {
    return database('sample_experiment_safety_inputs')
      .leftJoin(
        'samples',
        'sample_experiment_safety_inputs.sample_id',
        'samples.sample_id'
      )
      .select('samples.*')
      .where('sample_experiment_safety_inputs.esi_id', esiId)
      .then((records: SampleRecord[]) => {
        return records.map((record) => createSampleObject(record)) || [];
      });
  }
}

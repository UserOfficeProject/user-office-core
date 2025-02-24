import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';
import { injectable } from 'tsyringe';

import {
  Experiment,
  ExperimentHasSample,
  ExperimentSafety,
} from '../../models/Experiment';
import { Rejection } from '../../models/Rejection';
import { UpdateExperimentSafetyArgs } from '../../resolvers/mutations/UpdateExperimentSafetyMutation';
import { ExperimentDataSource } from '../ExperimentDataSource';
import database from './database';
import {
  ExperimentHasSampleRecord,
  ExperimentRecord,
  ExperimentSafetyRecord,
} from './records';

export function createExperimentObject(record: ExperimentRecord) {
  return new Experiment(
    record.experiment_pk,
    record.experiment_id,
    record.starts_at,
    record.ends_at,
    record.scheduled_event_id,
    record.proposal_pk,
    record.status,
    record.local_contact_id,
    record.instrument_id,
    record.created_at,
    record.updated_at
  );
}

export function createExperimentSafetyObject(record: ExperimentSafetyRecord) {
  return new ExperimentSafety(
    record.experiment_safety_pk,
    record.experiment_pk,
    record.esi_questionary_id,
    record.esi_questionary_submitted_at,
    record.created_by,
    record.status,
    record.safety_review_questionary_id,
    record.reviewed_by,
    record.created_at,
    record.updated_at
  );
}

export function createExperimentHasSampleObject(
  record: ExperimentHasSampleRecord
) {
  return new ExperimentHasSample(
    record.experiment_pk,
    record.sample_id,
    record.is_esi_submitted,
    record.sample_esi_questionary_id,
    record.created_at,
    record.updated_at
  );
}

@injectable()
export default class PostgresExperimentDataSource
  implements ExperimentDataSource
{
  constructor() {}

  async create(
    experiment: Omit<
      Experiment,
      'createdAt' | 'updatedAt' | 'experimentPk' | 'experimentId'
    >
  ): Promise<Experiment> {
    return database('experiments')
      .insert(
        {
          experiment_id: experiment.scheduledEventId.toString(),
          starts_at: experiment.startsAt,
          ends_at: experiment.endsAt,
          scheduled_event_id: experiment.scheduledEventId,
          proposal_pk: experiment.proposalPk,
          status: experiment.status,
          local_contact_id: experiment.localContactId,
          instrument_id: experiment.instrumentId,
        },
        '*'
      )
      .then((records: ExperimentRecord[]) => {
        if (records.length !== 1) {
          logger.logError('Could not create experiment', {
            experiment,
          });
          throw new GraphQLError('Failed to insert experiment');
        }

        return createExperimentObject(records[0]);
      });
  }

  async updateByScheduledEventId(
    experiment: Omit<
      Experiment,
      'createdAt' | 'updatedAt' | 'experimentPk' | 'experimentId'
    >
  ): Promise<Experiment> {
    return database('experiments')
      .where({ scheduled_event_id: experiment.scheduledEventId })
      .update(
        {
          starts_at: experiment.startsAt,
          ends_at: experiment.endsAt,
          status: experiment.status,
          local_contact_id: experiment.localContactId,
        },
        '*'
      )
      .then((records: ExperimentRecord[]) => {
        if (records.length !== 1) {
          logger.logError('Could not update experiment', {
            experiment,
          });
          throw new GraphQLError('Failed to update experiment');
        }

        return createExperimentObject(records[0]);
      });
  }

  async deleteByScheduledEventId(
    scheduledEventId: number
  ): Promise<Experiment> {
    return database('experiments')
      .where({ scheduled_event_id: scheduledEventId })
      .del()
      .returning('*')
      .then((records: ExperimentRecord[]) => {
        if (records.length !== 1) {
          logger.logError('Could not delete experiment for the scheuled ID', {
            scheduledEventId,
          });
          throw new GraphQLError('Failed to delete experiment');
        }

        return createExperimentObject(records[0]);
      });
  }

  async getUserUpcomingExperiments(userId: number): Promise<Experiment[]> {
    return database
      .union([
        // First query: Experiments where the user is in proposal_user
        database('experiments')
          .select('experiments.*')
          .join('proposals', 'experiments.proposal_pk', 'proposals.proposal_pk')
          .join(
            'proposal_user',
            'proposals.proposal_pk',
            'proposal_user.proposal_pk'
          )
          .where('proposal_user.user_id', userId)
          .andWhere('experiments.status', 'ACTIVE')
          .andWhere('experiments.ends_at', '>', new Date()),

        // Second query: Experiments where the user is the proposer in proposals
        database('experiments')
          .select('experiments.*')
          .join('proposals', 'experiments.proposal_pk', 'proposals.proposal_pk')
          .where('proposals.proposer_id', userId)
          .andWhere('experiments.status', 'ACTIVE')
          .andWhere('experiments.ends_at', '>', new Date()),
      ])
      .then((records: ExperimentRecord[]) => {
        return records.map(createExperimentObject);
      });
  }

  async getExperiment(experimentPk: number): Promise<Experiment | null> {
    return database('experiments')
      .where({ experiment_pk: experimentPk })
      .first()
      .then((record: ExperimentRecord | undefined) => {
        if (!record) {
          return null;
        }

        return createExperimentObject(record);
      });
  }

  async getExperimentSafety(
    experimentSafetyPk: number
  ): Promise<ExperimentSafety | null> {
    const result = await database
      .select('*')
      .from('experiment_safety')
      .where('experiment_safety_pk', experimentSafetyPk)
      .first();

    if (!result) {
      return null;
    }

    return createExperimentSafetyObject(result);
  }

  async getExperimentSafetyByExperimentPk(
    experimentPk: number
  ): Promise<ExperimentSafety | null> {
    const result = await database
      .select('*')
      .from('experiment_safety')
      .where('experiment_pk', experimentPk)
      .orderBy('created_at', 'desc')
      .first();

    if (!result) {
      return null;
    }

    return createExperimentSafetyObject(result);
  }

  async createExperimentSafety(
    experimentPk: number,
    questionaryId: number,
    creatorId: number
  ): Promise<ExperimentSafety | Rejection> {
    return database
      .insert({
        experiment_pk: experimentPk,
        esi_questionary_id: questionaryId,
        created_by: creatorId,
        status: '', //todo: add status
        safety_review_questionary_id: questionaryId, //todo: add safety_review_questionary_id
        reviewed_by: creatorId, //todo: add reviewed_by
      })
      .into('experiment_safety')
      .returning('*')
      .then((result: ExperimentSafetyRecord[]) =>
        createExperimentSafetyObject(result[0])
      );
  }

  async updateExperimentSafety(
    args: UpdateExperimentSafetyArgs
  ): Promise<ExperimentSafety> {
    return database('experiment_safety')
      .update({
        is_submitted: args.isSubmitted,
      })
      .where('esi_id', args.experimentSafetyPk)
      .returning('*')
      .then((result: ExperimentSafetyRecord[]) =>
        createExperimentSafetyObject(result[0])
      );
  }

  async getSamples(experimentPk: number): Promise<ExperimentHasSample[]> {
    return database('experiment_has_samples')
      .select('*')
      .where('experiment_pk', experimentPk)
      .then((records: ExperimentHasSampleRecord[]) =>
        records.map(createExperimentHasSampleObject)
      );
  }

  async attachSample(
    experimentPk: number,
    sampleId: number
  ): Promise<ExperimentHasSample[]> {
    return database('experiment_has_samples')
      .insert({
        experiment_pk: experimentPk,
        sample_id: sampleId,
      })
      .returning('*')
      .then((records: ExperimentHasSampleRecord[]) => {
        return records.map(createExperimentHasSampleObject);
      });
  }

  async getExperimentSafetyByESIQuestionaryId(
    esiQuestionaryId: number
  ): Promise<ExperimentSafety | null> {
    const result = await database
      .select('*')
      .from('experiment_safety')
      .where('esi_questionary_id', esiQuestionaryId)
      .first();

    if (!result) {
      return null;
    }

    return createExperimentSafetyObject(result);
  }

  addSampleToExperiment(
    experimentPk: number,
    sampleId: number,
    sampleEsiQuestionaryId: number
  ): Promise<ExperimentHasSample> {
    return database('experiment_has_samples')
      .insert({
        experiment_pk: experimentPk,
        sample_id: sampleId,
        is_esi_submitted: false,
        sample_esi_questionary_id: sampleEsiQuestionaryId,
      })
      .returning('*')
      .then((records: ExperimentHasSampleRecord[]) =>
        createExperimentHasSampleObject(records[0])
      );
  }
  removeSampleFromExperiment(
    experimentPk: number,
    sampleId: number
  ): Promise<ExperimentHasSample> {
    throw new Error('Method not implemented.');
  }
}

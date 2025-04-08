import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';
import { injectable } from 'tsyringe';

import {
  Experiment,
  ExperimentHasSample,
  ExperimentSafety,
} from '../../models/Experiment';
import { Rejection } from '../../models/Rejection';
import { SubmitExperimentSafetyArgs } from '../../resolvers/mutations/SubmitExperimentSafetyMutation';
import {
  ExperimentsArgs,
  UserExperimentsFilter,
} from '../../resolvers/queries/ExperimentsQuery';
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
    record.statusId,
    record.safety_review_questionary_id,
    record.reviewed_by,
    record.created_at,
    record.updated_at,
    record.instrument_scientist_decision,
    record.instrument_scientist_comment,
    record.experiment_safety_reviewer_decision,
    record.experiment_safety_reviewer_comment
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

  async getUserExperiments(
    userId: number,
    filter: UserExperimentsFilter
  ): Promise<Experiment[]> {
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
          .modify((query) => {
            if (filter?.endsAfter) {
              query.where('experiments.ends_at', '>', filter.endsAfter);
            }
            if (filter?.instrumentId) {
              query.where('experiments.instrument_id', filter.instrumentId);
            }
            if (filter?.status) {
              query.whereIn('experiments.status', filter.status);
            }
          }),

        // Second query: Experiments where the user is the proposer in proposals
        database('experiments')
          .select('experiments.*')
          .join('proposals', 'experiments.proposal_pk', 'proposals.proposal_pk')
          .where('proposals.proposer_id', userId)
          .modify((query) => {
            if (filter?.endsAfter) {
              query.where('experiments.ends_at', '>', filter.endsAfter);
            }
            if (filter?.instrumentId) {
              query.where('experiments.instrument_id', filter.instrumentId);
            }
            if (filter?.status) {
              query.whereIn('experiments.status', filter.status);
            }
          }),

        // Third query: Experiments where the user is the visitor
        database('experiments')
          .select('experiments.*')
          .join('visits', 'experiments.experiment_pk', 'visits.experiment_pk')
          .join(
            'visits_has_users',
            'visits.visit_id',
            'visits_has_users.visit_id'
          )
          .where('visits_has_users.user_id', userId)
          .modify((query) => {
            if (filter?.endsAfter) {
              query.where('experiments.ends_at', '>', filter.endsAfter);
            }
            if (filter?.instrumentId) {
              query.where('experiments.instrument_id', filter.instrumentId);
            }
            if (filter?.status) {
              query.whereIn('experiments.status', filter.status);
            }
          }),
      ])
      .orderBy('starts_at', 'asc')
      .then((records: ExperimentRecord[]) => {
        const experiments = records.map(createExperimentObject);

        // Sort experiments by starts_at (mapped to startsAt) ascending
        return experiments;
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

  async addExperimentSafetyReviewQuestionaryToExperimentSafety(
    experimentSafetyPk: number,
    questionaryId: number
  ): Promise<ExperimentSafety> {
    const result = await database('experiment_safety')
      .update({
        safety_review_questionary_id: questionaryId,
      })
      .where('experiment_safety_pk', experimentSafetyPk)
      .returning('*');

    if (!result) {
      throw new Error('Could not update experiment safety');
    }

    return createExperimentSafetyObject(result[0]);
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
        reviewed_by: creatorId, //todo: add reviewed_by
      })
      .into('experiment_safety')
      .returning('*')
      .then((result: ExperimentSafetyRecord[]) =>
        createExperimentSafetyObject(result[0])
      );
  }

  async submitExperimentSafety(
    args: SubmitExperimentSafetyArgs
  ): Promise<ExperimentSafety> {
    return database('experiment_safety')
      .update({
        esi_questionary_submitted_at: new Date(),
      })
      .where('experiment_safety_pk', args.experimentSafetyPk)
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

  async addSampleToExperiment(
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

  async removeSampleFromExperiment(
    experimentPk: number,
    sampleId: number
  ): Promise<ExperimentHasSample> {
    return database('experiment_has_samples')
      .where('experiment_pk', experimentPk)
      .andWhere('sample_id', sampleId)
      .del()
      .returning('*')
      .then((records: ExperimentHasSampleRecord[]) =>
        createExperimentHasSampleObject(records[0])
      );
  }

  async getExperimentSample(
    experimentPk: number,
    sampleId: number
  ): Promise<ExperimentHasSample | null> {
    return database('experiment_has_samples')
      .select('*')
      .where('experiment_pk', experimentPk)
      .andWhere('sample_id', sampleId)
      .first()
      .then((record: ExperimentHasSampleRecord | undefined) => {
        if (!record) {
          return null;
        }

        return createExperimentHasSampleObject(record);
      });
  }

  async updateExperimentSample(
    experimentPk: number,
    sampleId: number,
    isSubmitted: boolean
  ): Promise<ExperimentHasSample> {
    return database('experiment_has_samples')
      .where('experiment_pk', experimentPk)
      .andWhere('sample_id', sampleId)
      .update(
        {
          is_esi_submitted: isSubmitted,
        },
        '*'
      )
      .then((records: ExperimentHasSampleRecord[]) =>
        createExperimentHasSampleObject(records[0])
      );
  }

  async getExperimentSamples(
    experimentPk: number
  ): Promise<ExperimentHasSample[]> {
    return database('experiment_has_samples')
      .select('*')
      .where('experiment_pk', experimentPk)
      .then((records: ExperimentHasSampleRecord[]) =>
        records.map(createExperimentHasSampleObject)
      );
  }

  async getExperiments({ filter }: ExperimentsArgs): Promise<Experiment[]> {
    return database('experiments')
      .select('*')
      .modify((query) => {
        if (filter?.endsBefore) {
          query.where('ends_at', '<', filter.endsBefore);
        }
        if (filter?.endsAfter) {
          query.where('ends_at', '>', filter.endsAfter);
        }
        if (filter?.startsBefore) {
          query.where('starts_at', '<', filter.startsBefore);
        }
        if (filter?.startsAfter) {
          query.where('starts_at', '>', filter.startsAfter);
        }
        if (filter?.instrumentId) {
          query.where('instrument_id', filter.instrumentId);
        }
        if (filter?.status) {
          query.whereIn('status', filter.status);
        }
        if (filter?.callId) {
          query
            .leftJoin(
              'proposals',
              'proposals.proposal_pk',
              'experiments.proposal_pk'
            )
            .where('proposals.call_id', filter.callId);
        }
        const { from, to } = filter?.overlaps || {};
        if (from && to) {
          query.where((builder) =>
            builder
              .orWhere((subBuilder) =>
                subBuilder
                  .where('experiments.starts_at', '>=', from)
                  .andWhere('experiments.starts_at', '<=', to)
              )
              .orWhere((subBuilder) =>
                subBuilder
                  .where('experiments.ends_at', '>=', from)
                  .andWhere('experiments.ends_at', '<=', to)
              )
              .orWhere((subBuilder) =>
                subBuilder
                  .where('experiments.starts_at', '<=', from)
                  .andWhere('experiments.ends_at', '>=', from)
              )
              .orWhere((subBuilder) =>
                subBuilder
                  .where('experiments.starts_at', '<=', to)
                  .andWhere('experiments.ends_at', '>=', to)
              )
          );
        }
      })
      .then((rows: ExperimentRecord[]) =>
        rows.map((row) => createExperimentObject(row))
      );
  }

  async getExperimentsByProposalPk(proposalPk: number): Promise<Experiment[]> {
    return database('experiments')
      .select('*')
      .where('proposal_pk', proposalPk)
      .then((rows: ExperimentRecord[]) =>
        rows.map((row) => createExperimentObject(row))
      );
  }
}

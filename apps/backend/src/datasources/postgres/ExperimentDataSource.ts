import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';
import { injectable } from 'tsyringe';

import { Event } from '../../events/event.enum';
import {
  Experiment,
  ExperimentHasSample,
  ExperimentSafety,
  ExperimentSafetyReviewerDecisionEnum,
  InstrumentScientistDecisionEnum,
} from '../../models/Experiment';
import { Rejection } from '../../models/Rejection';
import { SubmitExperimentSafetyArgs } from '../../resolvers/mutations/SubmitExperimentSafetyMutation';
import {
  ExperimentsFilter,
  UserExperimentsFilter,
} from '../../resolvers/queries/ExperimentsQuery';
import { PaginationSortDirection } from '../../utils/pagination';
import { ExperimentDataSource } from '../ExperimentDataSource';
import database from './database';
import {
  ExperimentSafetyEventsRecord,
  ExperimentHasSampleRecord,
  ExperimentRecord,
  ExperimentSafetyRecord,
  ExperimentPaginatedRecord,
  createExperimentPaginatedObject,
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
    record.updated_at,
    record.reference_number_sequence
  );
}

export function createExperimentSafetyObject(record: ExperimentSafetyRecord) {
  return new ExperimentSafety(
    record.experiment_safety_pk,
    record.experiment_pk,
    record.esi_questionary_id,
    record.esi_questionary_submitted_at,
    record.created_by,
    record.status_id,
    record.safety_review_questionary_id,
    record.reviewed_by,
    record.created_at,
    record.updated_at,
    record.instrument_scientist_decision,
    record.instrument_scientist_decision_comment,
    record.experiment_safety_reviewer_decision,
    record.experiment_safety_reviewer_decision_comment
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

function generateExperimentId(
  proposalNumber: number,
  sequence: number | null
): string {
  return `${proposalNumber}-${sequence ?? 0}`;
}

const fieldMap: { [key: string]: string } = {
  experimentId: 'experiment_id',
};

@injectable()
export default class PostgresExperimentDataSource
  implements ExperimentDataSource
{
  constructor() {}

  async create(
    createExperimentPayload: Omit<
      Experiment,
      'createdAt' | 'updatedAt' | 'experimentPk' | 'experimentId'
    >
  ): Promise<Experiment> {
    const experiment: ExperimentRecord[] | undefined =
      await database.transaction(async (trx) => {
        try {
          const proposal = await database('proposals')
            .select('proposal_id', 'experiment_sequence')
            .where('proposal_pk', createExperimentPayload.proposalPk)
            .first()
            .forUpdate()
            .transacting(trx);

          if (!proposal) {
            logger.logError('Could not find proposal for experiment', {
              experiment,
            });
            throw new GraphQLError('Failed to find proposal for experiment');
          }
          const { proposal_id: proposalNumber, experiment_sequence: sequence } =
            proposal;
          const experimentId = await generateExperimentId(
            proposalNumber,
            sequence ?? 1
          );

          await database('proposals')
            .where('proposal_pk', createExperimentPayload.proposalPk)
            .update({
              experiment_sequence: sequence ? sequence + 1 : 2,
            })
            .transacting(trx);

          const experimentCreate = await database('experiments')
            .insert(
              {
                experiment_id: experimentId,
                starts_at: createExperimentPayload.startsAt,
                ends_at: createExperimentPayload.endsAt,
                scheduled_event_id: createExperimentPayload.scheduledEventId,
                proposal_pk: createExperimentPayload.proposalPk,
                status: createExperimentPayload.status,
                local_contact_id: createExperimentPayload.localContactId,
                instrument_id: createExperimentPayload.instrumentId,
                reference_number_sequence: sequence ?? 1,
              },
              '*'
            )
            .transacting(trx);

          return await trx.commit(experimentCreate);
        } catch (error) {
          await trx.rollback();
          logger.logError('Failed to create Experiment', {
            error,
          });
        }
      });

    if (!experiment || experiment.length === 0) {
      logger.logError('Failed to create Experiment', {
        experiment,
      });
      throw new GraphQLError('Failed to create experiment');
    }
    const createdExperiment = experiment[0];

    return createExperimentObject(createdExperiment);
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

  async updateExperimentSafety(
    experimentSafetyPk: number,
    updateFields: Partial<{
      safetyReviewQuestionaryId: number;
      esiQuestionarySubmittedAt: Date | null;
      instrumentScientistDecision: InstrumentScientistDecisionEnum | null;
      instrumentScientistComment: string | null;
      experimentSafetyReviewerDecision: ExperimentSafetyReviewerDecisionEnum | null;
      experimentSafetyReviewerComment: string | null;
      reviewedBy: number;
    }>
  ): Promise<ExperimentSafety> {
    // Create an object for database update with proper column names
    const updateObject: Record<string, any> = {};
    // Map the update fields to database column names
    if (updateFields.safetyReviewQuestionaryId !== undefined) {
      updateObject.safety_review_questionary_id =
        updateFields.safetyReviewQuestionaryId;
    }
    if (updateFields.esiQuestionarySubmittedAt !== undefined) {
      updateObject.esi_questionary_submitted_at =
        updateFields.esiQuestionarySubmittedAt;
    }
    if (updateFields.instrumentScientistDecision !== undefined) {
      updateObject.instrument_scientist_decision =
        updateFields.instrumentScientistDecision;
    }
    if (updateFields.instrumentScientistComment !== undefined) {
      updateObject.instrument_scientist_decision_comment =
        updateFields.instrumentScientistComment;
    }
    if (updateFields.experimentSafetyReviewerDecision !== undefined) {
      updateObject.experiment_safety_reviewer_decision =
        updateFields.experimentSafetyReviewerDecision;
    }
    if (updateFields.experimentSafetyReviewerComment !== undefined) {
      updateObject.experiment_safety_reviewer_decision_comment =
        updateFields.experimentSafetyReviewerComment;
    }
    if (updateFields.reviewedBy !== undefined) {
      updateObject.reviewed_by = updateFields.reviewedBy;
    }

    // Always update the updated_at timestamp
    updateObject.updated_at = new Date();
    const result = await database('experiment_safety')
      .update(updateObject)
      .where('experiment_safety_pk', experimentSafetyPk)
      .returning('*');

    if (!result || result.length === 0) {
      throw new Error('Could not update experiment safety');
    }

    return createExperimentSafetyObject(result[0]);
  }

  async updateExperimentSafetyStatus(
    experimentSafetyPk: number,
    statusId: number
  ): Promise<ExperimentSafety> {
    const result = await database('experiment_safety')
      .update({
        status_id: statusId,
      })
      .where('experiment_safety_pk', experimentSafetyPk)
      .returning('*');

    if (!result || result.length === 0) {
      throw new Error('Could not update experiment safety status');
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
    creatorId: number,
    statusId: number
  ): Promise<ExperimentSafety | Rejection> {
    return database
      .insert({
        experiment_pk: experimentPk,
        esi_questionary_id: questionaryId,
        created_by: creatorId,
        status_id: statusId,
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

  async getExperiments(
    filter?: ExperimentsFilter,
    first?: number,
    offset?: number,
    sortField?: string,
    sortDirection?: PaginationSortDirection,
    searchText?: string
  ): Promise<{ totalCount: number; experiments: Experiment[] }> {
    //print all arguments

    const query = database('experiments')
      .select(['*', database.raw('count(*) OVER() AS full_count')])
      .join(
        'proposals',
        'proposals.proposal_pk',
        '=',
        'experiments.proposal_pk'
      );

    // Add instrument scientist filtering if provided
    if (filter?.instrumentScientistUserId) {
      query
        .join(
          'instrument_has_scientists',
          'experiments.instrument_id',
          'instrument_has_scientists.instrument_id'
        )
        .where(
          'instrument_has_scientists.user_id',
          filter.instrumentScientistUserId
        );
    }

    return query
      .modify((query) => {
        if (filter?.experimentEndDate) {
          query.where('experiments.ends_at', '<=', filter.experimentEndDate);
        }
        if (filter?.experimentStartDate) {
          query.where(
            'experiments.starts_at',
            '>=',
            filter.experimentStartDate
          );
        }
        if (filter?.instrumentId) {
          query.where('experiments.instrument_id', filter.instrumentId);
        }
        if (filter?.experimentSafetyStatusId) {
          query
            .leftJoin(
              'experiment_safety',
              'experiments.experiment_pk',
              'experiment_safety.experiment_pk'
            )
            .where(
              'experiment_safety.status_id',
              filter?.experimentSafetyStatusId
            );
        }
        if (filter?.callId) {
          query.where('proposals.call_id', filter.callId);
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

        if (
          searchText !== '' &&
          searchText !== null &&
          searchText !== undefined
        ) {
          query.andWhere((qb) =>
            qb
              .orWhereRaw('experiment_id ILIKE ?', `%${searchText}%`)
              .orWhereRaw('proposal_id ILIKE ?', `%${searchText}%`)
          );
        }

        if (sortField && sortDirection) {
          if (!fieldMap.hasOwnProperty(sortField)) {
            throw new GraphQLError(`Bad sort field given: ${sortField}`);
          }
          sortField = fieldMap[sortField];
          query.orderBy(sortField, sortDirection);
        }

        if (first) {
          query.limit(first);
        }
        if (offset) {
          query.offset(offset);
        }
      })
      .then((experiments: ExperimentPaginatedRecord[]) => {
        return {
          totalCount: experiments[0] ? experiments[0].full_count : 0,
          experiments: experiments.map((experiment) =>
            createExperimentPaginatedObject(experiment)
          ),
        };
      });
  }

  async getExperimentsByProposalPk(proposalPk: number): Promise<Experiment[]> {
    return database('experiments')
      .select('*')
      .where('proposal_pk', proposalPk)
      .then((rows: ExperimentRecord[]) =>
        rows.map((row) => createExperimentObject(row))
      );
  }

  async markEventAsDoneOnExperimentSafeties(
    event: Event,
    experimentPks: number[]
  ): Promise<ExperimentSafetyEventsRecord[] | null> {
    const dataToInsert = experimentPks.map((experimentPk) => ({
      experiment_pk: experimentPk,
      [event.toLowerCase()]: true,
    }));
    const result = await database.raw(
      `? ON CONFLICT (experiment_pk)
        DO UPDATE SET
        ${event.toLowerCase()} = true
        RETURNING *;`,
      [database('experiment_safety_events').insert(dataToInsert)]
    );

    if (result.rows && result.rows.length) {
      return result.rows;
    } else {
      return null;
    }
  }
  async getExperimentSafetyEvents(
    experimentPk: number
  ): Promise<ExperimentSafetyEventsRecord | null> {
    const result = await database
      .select()
      .from('experiment_events')
      .where('experiment_pk', experimentPk)
      .first();

    if (!result) {
      return null;
    }

    return result;
  }
}

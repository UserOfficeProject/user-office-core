import { ExperimentSafetyInput } from '../../models/ExperimentSafetyInput';
import { Rejection } from '../../models/Rejection';
import { GetProposalEsisFilter } from '../../queries/ProposalEsiQueries';
import { UpdateEsiArgs } from '../../resolvers/mutations/UpdateEsiMutation';
import { ProposalEsiDataSource } from '../ProposalEsiDataSource';
import database from './database';
import { createEsiObject, EsiRecord } from './records';

class PostgresProposalEsiDataSource implements ProposalEsiDataSource {
  // Create
  createEsi(
    scheduledEventId: number,
    questionaryId: number,
    creatorId: number
  ): Promise<ExperimentSafetyInput | Rejection> {
    return database
      .insert({
        scheduled_event_id: scheduledEventId,
        questionary_id: questionaryId,
        creator_id: creatorId,
      })
      .into('experiment_safety_inputs')
      .returning('*')
      .then((result) => createEsiObject(result[0]));
  }

  // Read
  async getEsi(esiId: number): Promise<ExperimentSafetyInput | null> {
    const result = await database
      .select('*')
      .from('experiment_safety_inputs')
      .where('esi_id', esiId)
      .first();

    if (!result) {
      return null;
    }

    return createEsiObject(result);
  }

  async getEsis(
    filter: GetProposalEsisFilter
  ): Promise<ExperimentSafetyInput[]> {
    const esis: EsiRecord[] = await database
      .select('*')
      .from('experiment_safety_inputs')
      .modify((query) => {
        if (filter.scheduledEventId) {
          query.where('scheduled_event_id', filter.scheduledEventId);
        }
        if (filter.questionaryId) {
          query.where('questionary_id', filter.questionaryId);
        }
      });

    return esis.map((esi) => createEsiObject(esi));
  }

  // Update
  async updateEsi(args: UpdateEsiArgs): Promise<ExperimentSafetyInput> {
    return database('experiment_safety_inputs')
      .update({
        is_submitted: args.isSubmitted,
      })
      .where('esi_id', args.esiId)
      .returning('*')
      .then((result: EsiRecord[]) => createEsiObject(result[0]));
  }
}

export default PostgresProposalEsiDataSource;

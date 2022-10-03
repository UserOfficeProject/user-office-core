import { ExperimentSafetyInput } from '../../models/ExperimentSafetyInput';
import { Rejection } from '../../models/Rejection';
import { UpdateEsiArgs } from '../../resolvers/mutations/UpdateEsiMutation';
import { GetProposalEsisFilter } from '../../resolvers/queries/EsisQuery';
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
    filter?: GetProposalEsisFilter
  ): Promise<ExperimentSafetyInput[]> {
    const esis: EsiRecord[] = await database
      .select('*')
      .from('experiment_safety_inputs')
      .modify((query) => {
        if (filter?.scheduledEventId) {
          query.where('scheduled_event_id', filter.scheduledEventId);
        }
        if (filter?.questionaryId) {
          query.where('questionary_id', filter.questionaryId);
        }
        if (filter?.isSubmitted) {
          query.where('is_submitted', filter.isSubmitted);
        }
        if (filter?.callId) {
          query.join(
            'scheduled_events',
            'scheduled_events.scheduled_event_id',
            '=',
            'experiment_safety_inputs.scheduled_event_id'
          );
          query.join(
            'proposals',
            'proposals.proposal_pk',
            '=',
            'scheduled_events.proposal_pk'
          );
          query.join('call', 'proposals.call_id', '=', 'call.call_id');
          query.where('call.call_id', filter.callId);
        }
        if (filter?.hasEvaluation !== undefined) {
          query.join(
            'experiment_safety_documents',
            'experiment_safety_documents.esi_id',
            '=',
            'experiment_safety_inputs.esi_id'
          );
          if (filter.hasEvaluation === true) {
            query.whereNot('experiment_safety_documents.esd_id', null);
          } else if (filter.hasEvaluation === false) {
            query.where('experiment_safety_documents.esd_id', null);
          }
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

import { ExperimentSafetyInput } from '../../models/ExperimentSafetyInput';
import { GetProposalEsisFilter } from '../../queries/ProposalEsiQueries';
import { ProposalEsiDataSource } from '../ProposalEsiDataSource';
import database from './database';
import { createEsiObject, EsiRecord } from './records';

class PostgresProposalEsiDataSource implements ProposalEsiDataSource {
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
}

export default PostgresProposalEsiDataSource;

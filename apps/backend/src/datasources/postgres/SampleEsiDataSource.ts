import { injectable } from 'tsyringe';

import { SampleExperimentSafetyInput } from '../../models/SampleExperimentSafetyInput';
import { GetSampleEsisFilter } from '../../queries/SampleEsiQueries';
import { CreateSampleEsiInput } from '../../resolvers/mutations/CreateSampleEsiMutation';
import { DeleteSampleEsiInput } from '../../resolvers/mutations/DeleteSampleEsiMutation';
import { UpdateSampleEsiArgs } from '../../resolvers/mutations/UpdateSampleEsiMutation';
import { SampleEsiArgs } from '../../resolvers/queries/SampleEsiQuery';
import { SampleEsiDataSource } from '../SampleEsiDataSource';
import database from './database';
import { createSampleEsiObject, SampleEsiRecord } from './records';

@injectable()
class PostgresSampleEsiDataSource implements SampleEsiDataSource {
  // Create
  async createSampleEsi(
    args: CreateSampleEsiInput & { questionaryId: number }
  ): Promise<SampleExperimentSafetyInput> {
    return database('sample_experiment_safety_inputs')
      .insert({
        esi_id: args.esiId,
        sample_id: args.sampleId,
        questionary_id: args.questionaryId,
      })
      .returning('*')
      .then(([row]: SampleEsiRecord[]) => createSampleEsiObject(row));
  }

  // Read
  async getSampleEsi(
    args: SampleEsiArgs
  ): Promise<SampleExperimentSafetyInput | null> {
    return database
      .select('*')
      .from('sample_experiment_safety_inputs')
      .where('esi_id', args.esiId)
      .andWhere('sample_id', args.sampleId)
      .first()
      .then((row: SampleEsiRecord) =>
        row ? createSampleEsiObject(row) : null
      );
  }
  async getSampleEsis(
    filter: GetSampleEsisFilter
  ): Promise<SampleExperimentSafetyInput[]> {
    const esis: SampleEsiRecord[] = await database
      .select('*')
      .from('sample_experiment_safety_inputs')
      .modify((query) => {
        if (filter.esiId) {
          query.where('esi_id', filter.esiId);
        }
        if (filter.sampleId) {
          query.where('sample_id', filter.sampleId);
        }
      });

    return esis.map((esi) => createSampleEsiObject(esi));
  }

  // Update
  async updateSampleEsi(
    args: UpdateSampleEsiArgs & { questionaryId?: number }
  ): Promise<SampleExperimentSafetyInput> {
    return database('sample_experiment_safety_inputs')
      .update({
        questionaryId: args.questionaryId,
        is_submitted: args.isSubmitted,
      })
      .where({
        esi_id: args.esiId,
        sample_id: args.sampleId,
      })
      .returning('*')
      .then(([row]: SampleEsiRecord[]) => createSampleEsiObject(row));
  }

  // Delete
  async deleteSampleEsi(
    args: DeleteSampleEsiInput
  ): Promise<SampleExperimentSafetyInput> {
    return database('sample_experiment_safety_inputs')
      .delete()
      .where({
        esi_id: args.esiId,
        sample_id: args.sampleId,
      })
      .returning('*')
      .then(([result]: SampleEsiRecord[]) => createSampleEsiObject(result));
  }
}

export default PostgresSampleEsiDataSource;

import { SampleExperimentSafetyInput } from '../../models/SampleExperimentSafetyInput';
import { GetSampleEsisFilter } from '../../queries/SampleEsiQueries';
import { CreateSampleEsiInput } from '../../resolvers/mutations/CreateSampleEsiMutation';
import { DeleteSampleEsiInput } from '../../resolvers/mutations/DeleteSampleEsiMutation';
import { UpdateSampleEsiArgs } from '../../resolvers/mutations/UpdateSampleEsiMutation';
import { SampleEsiArgs } from '../../resolvers/queries/SampleEsiQuery';
import { SampleEsiDataSource } from '../SampleEsiDataSource';

export class SampleEsiDataSourceMock implements SampleEsiDataSource {
  esis: SampleExperimentSafetyInput[];
  constructor() {
    this.init();
  }

  public init() {
    this.esis = [new SampleExperimentSafetyInput(1, 1, 1, false)];
  }

  // Create
  async createSampleEsi(
    args: CreateSampleEsiInput & { questionaryId: number }
  ): Promise<SampleExperimentSafetyInput> {
    const newEsi = new SampleExperimentSafetyInput(
      2,
      args.sampleId,
      args.questionaryId,
      false
    );
    this.esis.push(newEsi);

    return newEsi;
  }

  // Read
  async getSampleEsi(
    args: SampleEsiArgs
  ): Promise<SampleExperimentSafetyInput | null> {
    return (
      this.esis.find(
        (esi) => esi.esiId === args.esiId && esi.sampleId === args.sampleId
      ) || null
    );
  }

  async getSampleEsis(
    filter: GetSampleEsisFilter
  ): Promise<SampleExperimentSafetyInput[]> {
    return this.esis.filter((esi) => {
      const isEsiIdMatch = filter.esiId ? esi.esiId === filter.esiId : true;
      const isSampleIdMatch = filter.sampleId
        ? esi.sampleId === filter.sampleId
        : true;

      return isEsiIdMatch && isSampleIdMatch;
    });
  }

  // Update
  async updateSampleEsi(
    args: UpdateSampleEsiArgs & { questionaryId?: number }
  ): Promise<SampleExperimentSafetyInput> {
    const esiToUpdate = (await this.getSampleEsi(args))!;
    if (args.isSubmitted !== undefined) {
      esiToUpdate.isSubmitted = args.isSubmitted;
    }
    if (args.questionaryId !== undefined) {
      esiToUpdate.questionaryId = args.questionaryId;
    }

    return esiToUpdate;
  }

  // Delete
  async deleteSampleEsi(
    args: DeleteSampleEsiInput
  ): Promise<SampleExperimentSafetyInput> {
    return this.esis.splice(
      this.esis.findIndex(
        (esi) => esi.esiId === args.esiId && esi.sampleId === args.sampleId
      ),
      1
    )[0];
  }
}

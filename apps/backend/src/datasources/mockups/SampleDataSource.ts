import { Sample, SampleStatus } from '../../models/Sample';
import { UpdateSampleArgs } from '../../resolvers/mutations/UpdateSampleMutation';
import { SamplesArgs } from '../../resolvers/queries/SamplesQuery';
import { SampleDataSource } from '../SampleDataSource';

export class SampleDataSourceMock implements SampleDataSource {
  samples: Sample[];
  constructor() {
    this.init();
  }

  public init() {
    this.samples = [
      new Sample(
        1,
        'title',
        1,
        1,
        1,
        'experiment_samples',
        false,
        SampleStatus.LOW_RISK,
        'safety comment',
        new Date(),
        1
      ),
    ];
  }
  async getSample(sampleId: number): Promise<Sample | null> {
    return this.samples.find((sample) => sample.id === sampleId) || null;
  }

  async getSamples(_args: SamplesArgs): Promise<Sample[]> {
    return this.samples;
  }

  async getSamplesByCallId(_callId: number): Promise<Sample[]> {
    return this.samples;
  }
  async create(
    title: string,
    creatorId: number,
    proposalPk: number,
    questionaryId: number,
    questionId: string
  ): Promise<Sample> {
    return new Sample(
      1,
      title,
      creatorId,
      proposalPk,
      questionaryId,
      questionId,
      false,
      SampleStatus.PENDING_EVALUATION,
      '',
      new Date(),
      null
    );
  }

  async delete(sampleId: number): Promise<Sample> {
    return this.samples.splice(
      this.samples.findIndex((sample) => sample.id == sampleId),
      1
    )[0];
  }

  async updateSample(args: UpdateSampleArgs): Promise<Sample> {
    const sample = await this.getSample(args.sampleId);
    if (!sample) {
      throw new Error('Sample not found');
    }
    sample.title = args.title || sample.title;
    sample.safetyComment = args.safetyComment || sample.safetyComment;
    sample.safetyStatus = args.safetyStatus || sample.safetyStatus;

    return sample;
  }

  async getSamplesByShipmentId(_shipmentId: number): Promise<Sample[]> {
    return this.samples;
  }

  async getSamplesByEsiId(_esiId: number): Promise<Sample[]> {
    return this.samples;
  }
}

import { Sample, SampleStatus } from '../../models/Sample';
import { UpdateSampleArgs } from '../../resolvers/mutations/UpdateSampleMutation';
import { SamplesArgs } from '../../resolvers/queries/SamplesQuery';
import { SampleDataSource } from '../SampleDataSource';

export class SampleDataSourceMock implements SampleDataSource {
  samples: Sample[];
  public init() {
    this.samples = [
      new Sample(
        1,
        'title',
        1,
        1,
        1,
        'sampleQuestionId',
        SampleStatus.LOW_RISK,
        'safety comment',
        new Date()
      ),
    ];
  }
  async getSample(sampleId: number): Promise<Sample> {
    return this.samples.find(sample => sample.id === sampleId)!;
  }

  async getSamples(args: SamplesArgs): Promise<Sample[]> {
    return this.samples;
  }

  async getSamplesByCallId(callId: number): Promise<Sample[]> {
    return this.samples;
  }
  async create(
    title: string,
    creatorId: number,
    proposalId: number,
    questionaryId: number,
    questionId: string
  ): Promise<Sample> {
    return new Sample(
      1,
      title,
      creatorId,
      proposalId,
      questionaryId,
      questionId,
      SampleStatus.PENDING_EVALUATION,
      '',
      new Date()
    );
  }

  async delete(sampleId: number): Promise<Sample> {
    return this.samples.splice(
      this.samples.findIndex(sample => sample.id == sampleId),
      1
    )[0];
  }

  async updateSample(args: UpdateSampleArgs): Promise<Sample> {
    const sample = await this.getSample(args.sampleId);
    sample.title = args.title || sample.title;
    sample.safetyComment = args.safetyComment || sample.safetyComment;
    sample.safetyStatus = args.safetyStatus || sample.safetyStatus;

    return sample;
  }

  async cloneSample(sampleId: number): Promise<Sample> {
    const sample = await this.getSample(sampleId);

    return { ...sample, id: sample.id++ };
  }

  async getSamplesByShipmentId(shipmentId: number): Promise<Sample[]> {
    return this.samples;
  }
}

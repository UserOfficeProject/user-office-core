import { Sample, SampleStatus } from '../../models/Sample';
import { UpdateSampleSafetyReviewArgs } from '../../resolvers/mutations/UpdateSampleSafetyReviewMutation';
import { UpdateSampleStatusArgs } from '../../resolvers/mutations/UpdateSampleStatusMutation';
import { UpdateSampleTitleArgs } from '../../resolvers/mutations/UpdateSampleTitleMutation';
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
  async getSamplesByAnswerId(answerId: number): Promise<Sample[]> {
    return this.samples;
  }
  async getSamplesByCallId(callId: number): Promise<Sample[]> {
    return this.samples;
  }
  async create(
    questionaryId: number,
    title: string,
    creatorId: number
  ): Promise<Sample> {
    return new Sample(
      1,
      title,
      creatorId,
      questionaryId,
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
  async updateSampleStatus(args: UpdateSampleStatusArgs): Promise<Sample> {
    const sample = await this.getSample(args.sampleId);
    sample.safetyStatus = args.status;

    return sample;
  }
  async updateSampleTitle(args: UpdateSampleTitleArgs): Promise<Sample> {
    const sample = await this.getSample(args.sampleId);
    sample.title = args.title;

    return sample;
  }

  async updateSampleSafetyReview(
    args: UpdateSampleSafetyReviewArgs
  ): Promise<Sample> {
    const sample = await this.getSample(args.id);
    sample.safetyStatus = args.safetyStatus;
    sample.safetyComment = args.safetyComment;

    return sample;
  }

  async cloneSample(sampleId: number): Promise<Sample> {
    const sample = await this.getSample(sampleId);

    return { ...sample, id: sample.id++ };
  }
}

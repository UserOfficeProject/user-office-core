import { Sample, SampleStatus } from '../../models/Sample';
import { SamplesArgs } from '../../resolvers/queries/SamplesQuery';
import { SampleDataSource } from '../SampleDataSource';
import { UpdateSampleTitleArgs } from '../../resolvers/mutations/UpdateSampleTitle';

export class SampleDataSourceMock implements SampleDataSource {
  updateSampleTitle(args: UpdateSampleTitleArgs): Promise<Sample> {
    return this.getSample(args.sampleId).then(sample => {
      sample.title = args.title;
      return sample;
    });
  }
  samples: Sample[];
  public init() {
    this.samples = [
      new Sample(1, 'title', 1, 1, SampleStatus.SAFE, new Date()),
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
      SampleStatus.NONE,
      new Date()
    );
  }
}

import { Sample } from '../models/Sample';
import { UpdateSampleTitleArgs } from '../resolvers/mutations/UpdateSampleTitle';
import { SamplesArgs } from '../resolvers/queries/SamplesQuery';

export interface SampleDataSource {
  updateSampleTitle(args: UpdateSampleTitleArgs): Promise<Sample>;
  create(
    questionaryId: number,
    title: string,
    creatorId: number
  ): Promise<Sample>;
  getSample(sampleId: number): Promise<Sample>;
  getSamplesByCallId(callId: number): Promise<Sample[]>;
  getSamplesByAnswerId(answerId: number): Promise<Sample[]>;
  getSamples(args: SamplesArgs): Promise<Sample[]>;
}

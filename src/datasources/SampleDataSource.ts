import { Sample } from '../models/Sample';
import { UpdateSampleSafetyReviewArgs } from '../resolvers/mutations/UpdateSampleSafetyReviewMutation';
import { UpdateSampleStatusArgs } from '../resolvers/mutations/UpdateSampleStatusMutation';
import { UpdateSampleTitleArgs } from '../resolvers/mutations/UpdateSampleTitleMutation';
import { SamplesArgs } from '../resolvers/queries/SamplesQuery';

export interface SampleDataSource {
  delete(sampleId: number): Promise<Sample>;
  updateSampleStatus(args: UpdateSampleStatusArgs): Promise<Sample>;
  updateSampleTitle(args: UpdateSampleTitleArgs): Promise<Sample>;
  create(
    questionaryId: number,
    title: string,
    creatorId: number
  ): Promise<Sample>;
  updateSampleSafetyReview(args: UpdateSampleSafetyReviewArgs): Promise<Sample>;
  getSample(sampleId: number): Promise<Sample>;
  getSamplesByCallId(callId: number): Promise<Sample[]>;
  getSamplesByAnswerId(answerId: number): Promise<Sample[]>;
  getSamples(args: SamplesArgs): Promise<Sample[]>;
}

import { Sample } from '../models/Sample';
import { SamplesArgs } from '../resolvers/queries/SamplesQuery';

export interface SampleDataSource {
  getSamplesByCallId(callId: number): Promise<Sample[]>;;
  getSamplesByAnswerId(answerId: number): Promise<Sample[]>;
  getSamples(args: SamplesArgs): Promise<Sample[]>;
}

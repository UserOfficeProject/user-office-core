import { Sample } from '../models/Sample';
import { SamplesArgs } from '../resolvers/queries/SamplesQuery';

export interface SampleDataSource {
  getSamples(args: SamplesArgs): Promise<Sample[]>;
}

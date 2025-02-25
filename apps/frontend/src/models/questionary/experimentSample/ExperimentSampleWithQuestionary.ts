import { GetExperimentSampleQuery } from '../../../generated/sdk';

export type ExperimentSampleWithQuestionary = NonNullable<
  GetExperimentSampleQuery['experimentSample']
>;

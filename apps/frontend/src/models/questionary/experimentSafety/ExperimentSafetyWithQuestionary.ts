import { GetExperimentSafetyQuery } from '../../../generated/sdk';

export type ExperimentSafetyWithQuestionary = NonNullable<
  GetExperimentSafetyQuery['experimentSafety']
>;

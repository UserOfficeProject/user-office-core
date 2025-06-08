import { CreateOrGetExperimentSafetyMutation } from 'generated/sdk';

export type ExperimentSafetyWithQuestionary = NonNullable<
  CreateOrGetExperimentSafetyMutation['createExperimentSafety']
>;

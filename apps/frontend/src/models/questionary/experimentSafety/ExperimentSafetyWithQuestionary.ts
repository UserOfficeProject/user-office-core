import {
  CreateOrGetExperimentSafetyMutation,
  ReviewExperimentSafetyMutation,
} from 'generated/sdk';

export type ExperimentSafetyWithQuestionary = NonNullable<
  CreateOrGetExperimentSafetyMutation['createExperimentSafety']
>;

export type ExperimentSafetyWithReviewQuestionary = NonNullable<
  ReviewExperimentSafetyMutation['reviewExperimentSafety']
>;

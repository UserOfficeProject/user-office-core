import {
  ExperimentSafetyReviewerDecisionEnum,
  InstrumentScientistDecisionEnum,
  UserRole,
} from 'generated/sdk';
import { ExperimentSafetyReviewSubmissionState } from 'models/questionary/experimentSafetyReview/ExperimentSafetyReviewSubmissionState';
import { QuestionarySubmissionState } from 'models/questionary/QuestionarySubmissionState';

import { QuestionaryWizardStep } from '../../DefaultWizardStepFactory';

export class ExperimentSafetyReviewQuestionaryWizardStep extends QuestionaryWizardStep {
  isItemWithQuestionaryEditable(state: QuestionarySubmissionState) {
    const { experimentSafety, currentUserRole } =
      state as ExperimentSafetyReviewSubmissionState;

    // Check if any decision has been made (not null, not undefined, not UNSET)
    const hasInstrumentScientistDecision =
      experimentSafety.instrumentScientistDecision !== null &&
      experimentSafety.instrumentScientistDecision !== undefined &&
      experimentSafety.instrumentScientistDecision !==
        InstrumentScientistDecisionEnum.UNSET;

    const hasExperimentSafetyReviewerDecision =
      experimentSafety.experimentSafetyReviewerDecision !== null &&
      experimentSafety.experimentSafetyReviewerDecision !== undefined &&
      experimentSafety.experimentSafetyReviewerDecision !==
        ExperimentSafetyReviewerDecisionEnum.UNSET;

    // If the logged-in user is an Instrument Scientist and their decision is made, disable the form
    if (
      currentUserRole === UserRole.INSTRUMENT_SCIENTIST &&
      hasInstrumentScientistDecision
    ) {
      return false;
    }

    // If the logged-in user is an Experiment Safety Reviewer and their decision is made, disable the form
    if (
      currentUserRole === UserRole.EXPERIMENT_SAFETY_REVIEWER &&
      hasExperimentSafetyReviewerDecision
    ) {
      return false;
    }

    return true;
  }
}

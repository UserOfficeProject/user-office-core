import {
  ExperimentSafetyReviewerDecisionEnum,
  InstrumentScientistDecisionEnum,
} from 'generated/sdk';
import { ExperimentSafetyReviewSubmissionState } from 'models/questionary/experimentSafetyReview/ExperimentSafetyReviewSubmissionState';
import { QuestionarySubmissionState } from 'models/questionary/QuestionarySubmissionState';

import { QuestionaryWizardStep } from '../../DefaultWizardStepFactory';

export class ExperimentSafetyReviewQuestionaryWizardStep extends QuestionaryWizardStep {
  isItemWithQuestionaryEditable(state: QuestionarySubmissionState) {
    const { experimentSafety } = state as ExperimentSafetyReviewSubmissionState;

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

    // If any decision has been made, the form should not be editable
    // if (hasInstrumentScientistDecision || hasExperimentSafetyReviewerDecision) {
    //   return false;
    // }

    return true;
  }
}

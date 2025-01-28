import { QuestionarySubmissionState } from 'models/questionary/QuestionarySubmissionState';

import { TechnicalReviewSubmissionState } from '../../../../models/questionary/technicalReview/TechnicalReviewSubmissionState';
import { QuestionaryWizardStep } from '../../DefaultWizardStepFactory';

export class TechnicalReviewQuestionaryWizardStep extends QuestionaryWizardStep {
  isItemWithQuestionaryEditable(state: QuestionarySubmissionState) {
    const { technicalReview, fapChairOrSecCanEdit } =
      state as TechnicalReviewSubmissionState;

    return (
      (state.stepIndex == 0 && fapChairOrSecCanEdit) ||
      technicalReview.submitted === false
    );
  }
}

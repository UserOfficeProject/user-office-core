import { QuestionarySubmissionState } from 'models/questionary/QuestionarySubmissionState';

import { TechnicalReviewSubmissionState } from '../../../../models/questionary/technicalReview/TechnicalReviewSubmissionState';
import { QuestionaryWizardStep } from '../../DefaultWizardStepFactory';

export class TechnicalReviewQuestionaryWizardStep extends QuestionaryWizardStep {
  isItemWithQuestionaryEditable(state: QuestionarySubmissionState) {
    const { technicalReview } = state as TechnicalReviewSubmissionState;

    return !technicalReview.submitted;
  }
}

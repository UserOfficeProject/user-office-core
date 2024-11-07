import { ReviewStatus } from 'generated/sdk';
import { FapReviewSubmissionState } from 'models/questionary/fapReview/FapReviewSubmissionState';
import { QuestionarySubmissionState } from 'models/questionary/QuestionarySubmissionState';

import { QuestionaryWizardStep } from '../../DefaultWizardStepFactory';

export class FapReviewQuestionaryWizardStep extends QuestionaryWizardStep {
  isItemWithQuestionaryEditable(state: QuestionarySubmissionState) {
    const { fapReview } = state as FapReviewSubmissionState;

    return fapReview.status === ReviewStatus.DRAFT;
  }
}

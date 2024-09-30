import { ReviewStatus } from 'generated/sdk';
import { FapReviewSubmissionState } from 'models/questionary/fapReview/FapReviewSubmissionState';
import { QuestionarySubmissionState } from 'models/questionary/QuestionarySubmissionState';
import { isCallEnded } from 'utils/helperFunctions';

import { QuestionaryWizardStep } from '../../DefaultWizardStepFactory';

export class FapReviewQuestionaryWizardStep extends QuestionaryWizardStep {
  isItemWithQuestionaryEditable(state: QuestionarySubmissionState) {
    const { fapReview } = state as FapReviewSubmissionState;
    const isCallInternalActive = fapReview.call?.isActiveInternal ?? false;
    const callHasEnded = isCallEnded(
      fapReview.proposal?.call?.startCall,
      fapReview.proposal?.call?.endCall
    );

    if (callHasEnded && !isCallInternalActive) {
      return false;
    } else {
      return fapReview.status === ReviewStatus.DRAFT;
    }
  }
}

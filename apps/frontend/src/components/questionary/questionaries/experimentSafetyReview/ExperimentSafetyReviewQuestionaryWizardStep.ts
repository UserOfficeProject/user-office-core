import { QuestionarySubmissionState } from 'models/questionary/QuestionarySubmissionState';

import { QuestionaryWizardStep } from '../../DefaultWizardStepFactory';

export class ExperimentSafetyReviewQuestionaryWizardStep extends QuestionaryWizardStep {
  isItemWithQuestionaryEditable(state: QuestionarySubmissionState) {
    // TODO: When the experiment safety review is submitted by the safety officer, this should not be editable anymore(ie., false)
    console.log({ state });

    return true;

    // return (
    //   (state.stepIndex == 0 && fapChairOrSecCanEdit) ||
    //   technicalReview.submitted === false
    // );
  }
}

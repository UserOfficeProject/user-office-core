import { ExperimentSafetyReviewSubmissionState } from 'models/questionary/experimentSafetyReview/ExperimentSafetyReviewSubmissionState';

import { QuestionaryWizardStep } from '../../DefaultWizardStepFactory';

export class ExperimentSafetyReviewQuestionaryWizardStep extends QuestionaryWizardStep {
  isItemWithQuestionaryEditable(state: ExperimentSafetyReviewSubmissionState) {
    return true;

    // return (
    //   (state.stepIndex == 0 && fapChairOrSecCanEdit) ||
    //   technicalReview.submitted === false
    // );
  }

  getMetadata(state: ExperimentSafetyReviewSubmissionState) {
    const check = {
      title: this.step.topic.title,
      isCompleted: this.step.isCompleted,
      isReadonly:
        !this.isItemWithQuestionaryEditable(state) ||
        (this.index > 0 &&
          state.questionary.steps[this.index - 1].isCompleted === false),
    };

    return check;
  }
}

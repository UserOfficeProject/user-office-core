import {
  QuestionarySubmissionState,
  WizardStep,
} from 'models/questionary/QuestionarySubmissionState';
import { StepType } from 'models/questionary/StepType';

export class DefaultReviewWizardStep implements WizardStep {
  public type: StepType = 'VisitReview';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public payload?: any;

  constructor(
    private isReviewStepCompleted: {
      (state: QuestionarySubmissionState): boolean;
    }
  ) {}

  getMetadata(state: QuestionarySubmissionState) {
    const lastProposalStep =
      state.questionary.steps[state.questionary.steps.length - 1];

    return {
      title: 'Review',
      isCompleted: this.isReviewStepCompleted(state),
      isReadonly: lastProposalStep.isCompleted === false,
    };
  }
}

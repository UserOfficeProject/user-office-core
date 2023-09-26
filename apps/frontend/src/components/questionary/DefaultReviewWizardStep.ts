import {
  QuestionarySubmissionState,
  WizardStep,
} from 'models/questionary/QuestionarySubmissionState';
import { StepType } from 'models/questionary/StepType';

export class DefaultReviewWizardStep implements WizardStep {
  public type: StepType = 'ReviewStep';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public payload?: any;

  constructor(
    private isReviewStepCompleted: (
      state: QuestionarySubmissionState
    ) => boolean
  ) {}

  getMetadata(state: QuestionarySubmissionState) {
    const lastStep =
      state.questionary.steps[state.questionary.steps.length - 1];
    const isLastStepCompleted = lastStep.isCompleted;

    return {
      title: 'Review',
      isCompleted: this.isReviewStepCompleted(state),
      isReadonly: isLastStepCompleted === false,
    };
  }
}

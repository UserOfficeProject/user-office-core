import { QuestionaryStep } from 'generated/sdk';
import {
  QuestionarySubmissionState,
  WizardStep,
} from 'models/questionary/QuestionarySubmissionState';
import { StepType } from 'models/questionary/StepType';

/**
 * Default WizardStepsFactory
 * Defines steps where first n steps are steps from questionary, where n is questionary topic count,
 * and the last step is a review step.
 *
 * Get steps by calling `getWizardSteps()` method
 * */

export class DefaultWizardStepFactory {
  constructor(
    private questionaryWizardStep: {
      new (step: QuestionaryStep, index: number): WizardStep;
    },
    private reviewWizardStep: WizardStep
  ) {}

  getWizardSteps(questionarySteps: QuestionaryStep[]): WizardStep[] {
    const wizardSteps: WizardStep[] = [];

    questionarySteps.forEach((step, index) =>
      wizardSteps.push(new this.questionaryWizardStep(step, index))
    );

    wizardSteps.push(this.reviewWizardStep);

    return wizardSteps;
  }
}

/**
 * Default behavior of QuestionaryWizard step.
 * Step is editable if the ItemWithQuestionary (such as proposal, sample, shipment, etc)
 * is editable and the previous step is completed.
 *
 * To use this class you have to extend and implement
 * `isItemWithQuestionaryEditable(state:QuestionarySubmissionState)`
 * */
export abstract class QuestionaryWizardStep implements WizardStep {
  public type: StepType = 'QuestionaryStep';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public payload?: any;

  constructor(private step: QuestionaryStep, private index: number) {
    this.payload = {
      topicId: this.step.topic.id,
      questionaryStepIndex: this.index,
    };
  }

  /**
   * Returns true if the user can edit the item which has the associated Questionary with it.
   * For example if the item is submitted you want to return false, and true while it is in draft.
   * Returning false will effectively make sure that the questionary step is not editable.
   * */
  abstract isItemWithQuestionaryEditable(
    state: QuestionarySubmissionState
  ): boolean;

  getMetadata(state: QuestionarySubmissionState) {
    return {
      title: this.step.topic.title,
      isCompleted: this.step.isCompleted,
      isReadonly:
        !this.isItemWithQuestionaryEditable(state) ||
        (this.index > 0 &&
          state.questionary.steps[this.index - 1].isCompleted === false),
    };
  }
}

export abstract class ReviewWizardStep {}

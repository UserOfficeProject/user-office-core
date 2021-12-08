import { immerable } from 'immer';

import { Questionary } from 'generated/sdk';

import {
  QuestionarySubmissionState,
  WizardStep,
} from '../QuestionarySubmissionState';
import { FeedbackWithQuestionary } from './FeedbackWithQuestionary';

export class FeedbackSubmissionState extends QuestionarySubmissionState {
  [immerable] = true;
  constructor(
    public feedback: FeedbackWithQuestionary,
    stepIndex: number,
    isDirty: boolean,
    wizardSteps: WizardStep[]
  ) {
    super(stepIndex, isDirty, wizardSteps);
  }

  get itemWithQuestionary() {
    return this.feedback;
  }

  set itemWithQuestionary(item: { questionary: Questionary }) {
    this.feedback = { ...this.feedback, ...item };
  }
}

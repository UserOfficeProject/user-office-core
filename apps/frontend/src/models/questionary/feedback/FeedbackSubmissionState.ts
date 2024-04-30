import { immerable } from 'immer';

import { Questionary, TemplateGroupId } from 'generated/sdk';

import { FeedbackWithQuestionary } from './FeedbackWithQuestionary';
import { QuestionarySubmissionState } from '../QuestionarySubmissionState';

export class FeedbackSubmissionState extends QuestionarySubmissionState {
  [immerable] = true;
  constructor(public feedback: FeedbackWithQuestionary) {
    super(TemplateGroupId.FEEDBACK, feedback);
    this.stepIndex = this.getInitialStepIndex();
  }

  getItemId(): number {
    return this.feedback.id;
  }

  get itemWithQuestionary() {
    return this.feedback;
  }

  set itemWithQuestionary(item: { questionary: Questionary }) {
    this.feedback = { ...this.feedback, ...item };
  }
}

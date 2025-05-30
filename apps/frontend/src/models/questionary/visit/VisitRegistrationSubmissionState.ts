import { immerable } from 'immer';

import { Questionary, TemplateGroupId } from 'generated/sdk';

import { RegistrationWithQuestionary } from './VisitRegistrationWithQuestionary';
import { QuestionarySubmissionState } from '../QuestionarySubmissionState';

export class VisitRegistrationSubmissionState extends QuestionarySubmissionState {
  [immerable] = true;
  constructor(public registration: RegistrationWithQuestionary) {
    super(TemplateGroupId.VISIT_REGISTRATION, registration);
    this.stepIndex = this.getInitialStepIndex();
  }

  getItemId(): [number, number] {
    return [this.registration.visitId, this.registration.userId];
  }

  get itemWithQuestionary() {
    return this.registration;
  }

  set itemWithQuestionary(item: { questionary: Questionary }) {
    this.registration = { ...this.registration, ...item };
  }
}

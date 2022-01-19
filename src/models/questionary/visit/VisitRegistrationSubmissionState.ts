import { immerable } from 'immer';

import { Questionary, TemplateGroupId } from 'generated/sdk';

import { QuestionarySubmissionState } from '../QuestionarySubmissionState';
import { RegistrationWithQuestionary } from './VisitRegistrationWithQuestionary';

export class VisitRegistrationSubmissionState extends QuestionarySubmissionState {
  [immerable] = true;
  constructor(public registration: RegistrationWithQuestionary) {
    super(TemplateGroupId.VISIT_REGISTRATION, registration);
    this.stepIndex = this.getInitialStepIndex();
  }

  getItemId(): number {
    return this.registration.visitId;
  }

  get itemWithQuestionary() {
    return this.registration;
  }

  set itemWithQuestionary(item: { questionary: Questionary }) {
    this.registration = { ...this.registration, ...item };
  }
}

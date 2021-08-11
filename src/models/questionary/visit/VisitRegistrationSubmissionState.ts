import { immerable } from 'immer';

import { Questionary } from 'generated/sdk';

import {
  QuestionarySubmissionState,
  WizardStep,
} from '../QuestionarySubmissionState';
import { RegistrationWithQuestionary } from './VisitRegistrationWithQuestionary';

export class VisitRegistrationSubmissionState extends QuestionarySubmissionState {
  [immerable] = true;
  constructor(
    public registration: RegistrationWithQuestionary,
    stepIndex: number,
    isDirty: boolean,
    wizardSteps: WizardStep[]
  ) {
    super(stepIndex, isDirty, wizardSteps);
  }

  get itemWithQuestionary() {
    return this.registration;
  }

  set itemWithQuestionary(item: { questionary: Questionary }) {
    this.registration = { ...this.registration, ...item };
  }
}

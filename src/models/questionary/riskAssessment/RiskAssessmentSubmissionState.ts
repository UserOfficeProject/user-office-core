import { immerable } from 'immer';

import { Questionary } from 'generated/sdk';

import {
  QuestionarySubmissionState,
  WizardStep,
} from '../QuestionarySubmissionState';
import { RiskAssessmentWithQuestionary } from './RiskAssessmentWithQuestionary';

export class RiskAssessmentSubmissionState extends QuestionarySubmissionState {
  [immerable] = true;
  constructor(
    public riskAssessment: RiskAssessmentWithQuestionary,
    stepIndex: number,
    isDirty: boolean,
    wizardSteps: WizardStep[]
  ) {
    super(stepIndex, isDirty, wizardSteps);
  }

  get itemWithQuestionary() {
    return this.riskAssessment;
  }

  set itemWithQuestionary(item: { questionary: Questionary }) {
    this.riskAssessment = { ...this.riskAssessment, ...item };
  }
}

import { immerable } from 'immer';

import {
  GetRiskAssessmentQuery,
  Questionary,
  RiskAssessmentFragment,
} from './../generated/sdk';
import {
  QuestionarySubmissionState,
  WizardStep,
} from './QuestionarySubmissionState';

export type RiskAssessmentCore = RiskAssessmentFragment;

export type RiskAssessmentWithQuestionary = Exclude<
  GetRiskAssessmentQuery['riskAssessment'],
  null
>;

// TODO make all XCore and XWithQuestionary follow the same naming convention and file structure

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

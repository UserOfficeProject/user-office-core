import { immerable } from 'immer';

import {
  GetRiskAssessmentQuery,
  Questionary,
  RiskAssessmentFragment,
} from './../generated/sdk';
import {
  QuestionarySubmissionState,
  WizardStep,
} from './questionary/QuestionarySubmissionState';

export type RiskAssessmentCore = RiskAssessmentFragment;

export type RiskAssessmentWithQuestionary = Exclude<
  GetRiskAssessmentQuery['riskAssessment'],
  null
>;
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

import { immerable } from 'immer';

import { Questionary } from 'generated/sdk';

import { ExperimentSafetyWithQuestionary } from './ExperimentSafetyWithQuestionary';
import { TemplateGroupId } from '../../../generated/sdk';
import { QuestionarySubmissionState } from '../QuestionarySubmissionState';

export class ExperimentSafetyReviewSubmissionState extends QuestionarySubmissionState {
  [immerable] = true;
  constructor(public experimentSafety: ExperimentSafetyWithQuestionary) {
    super(TemplateGroupId.EXP_SAFETY_REVIEW, experimentSafety);
    this.stepIndex = this.getInitialStepIndex();
  }

  getItemId(): number {
    return this.experimentSafety.experimentPk;
  }

  get itemWithQuestionary() {
    return this.experimentSafety;
  }

  set itemWithQuestionary(item: { questionary: Questionary }) {
    this.experimentSafety = { ...this.experimentSafety, ...item };
  }

  get questionary() {
    return this.experimentSafety.safetyReviewQuestionary;
  }

  set questionary(safetyReviewQuestionary) {
    this.experimentSafety.safetyReviewQuestionary = safetyReviewQuestionary;
  }
}

import { immerable } from 'immer';

import { Questionary } from 'generated/sdk';

import { ExperimentSafetyWithReviewQuestionary } from './ExperimentSafetyReviewWithQuestionary';
import { TemplateGroupId } from '../../../generated/sdk';
import { QuestionarySubmissionState } from '../QuestionarySubmissionState';

export class ExperimentSafetyReviewSubmissionState extends QuestionarySubmissionState {
  [immerable] = true;
  constructor(public experimentSafety: ExperimentSafetyWithReviewQuestionary) {
    super(TemplateGroupId.EXP_SAFETY_REVIEW, {
      questionary: experimentSafety.safetyReviewQuestionary,
    });
    this.stepIndex = this.getInitialStepIndex();
  }

  getItemId(): number {
    return this.experimentSafety.experimentSafetyPk;
  }

  get itemWithQuestionary() {
    return {
      questionary: this.experimentSafety.safetyReviewQuestionary,
    };
  }

  set itemWithQuestionary(item: { questionary: Questionary }) {
    this.experimentSafety = {
      ...this.experimentSafety,
      safetyReviewQuestionary: item.questionary,
    };
  }
}

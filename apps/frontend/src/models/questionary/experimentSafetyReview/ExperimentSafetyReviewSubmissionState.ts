import { immerable } from 'immer';

import { Questionary, UserRole } from 'generated/sdk';

import { ExperimentSafetyReviewWithQuestionary } from './ExperimentSafetyReviewWithQuestionary';
import { TemplateGroupId } from '../../../generated/sdk';
import { QuestionarySubmissionState } from '../QuestionarySubmissionState';

export class ExperimentSafetyReviewSubmissionState extends QuestionarySubmissionState {
  [immerable] = true;
  constructor(
    public experimentSafety: ExperimentSafetyReviewWithQuestionary,
    public currentUserRole?: UserRole | null,
    public isPreviewMode?: boolean
  ) {
    super(
      TemplateGroupId.EXP_SAFETY_REVIEW,
      {
        questionary: experimentSafety.safetyReviewQuestionary,
      },
      isPreviewMode
    );
    this.stepIndex = this.getInitialStepIndex();
  }

  getItemId(): number {
    return this.experimentSafety.experimentSafetyPk;
  }

  get itemWithQuestionary() {
    return {
      questionary: this.experimentSafety.safetyReviewQuestionary, // attach as questionary for reducer compatibility
      safetyReviewQuestionary: this.experimentSafety.safetyReviewQuestionary,
    };
  }

  set itemWithQuestionary(item: {
    questionary: Questionary;
    safetyReviewQuestionary: Questionary;
  }) {
    this.experimentSafety = {
      ...this.experimentSafety,
      safetyReviewQuestionary: item.safetyReviewQuestionary,
    };
  }
}

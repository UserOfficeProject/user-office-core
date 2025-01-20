import { immerable } from 'immer';

import { Questionary, TemplateGroupId } from 'generated/sdk';

import { TechnicalReviewWithQuestionary } from './TechnicalReviewWithQuestionary';
import { QuestionarySubmissionState } from '../QuestionarySubmissionState';

export class TechnicalReviewSubmissionState extends QuestionarySubmissionState {
  [immerable] = true;
  constructor(
    public technicalReview: TechnicalReviewWithQuestionary,
    public isPreviewMode: boolean | undefined,
    public reviewerId: number,
    public files: string
  ) {
    super(TemplateGroupId.TECHNICAL_REVIEW, technicalReview, isPreviewMode);
    this.stepIndex = this.getInitialStepIndex();
  }

  getItemId(): number {
    return this.technicalReview.id;
  }

  get itemWithQuestionary() {
    return this.technicalReview;
  }

  set itemWithQuestionary(item: { questionary: Questionary }) {
    this.technicalReview = { ...this.technicalReview, ...item };
  }
}

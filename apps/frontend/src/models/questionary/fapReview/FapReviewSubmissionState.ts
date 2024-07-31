import { immerable } from 'immer';

import { Questionary, TemplateGroupId } from 'generated/sdk';

import { FapReviewWithQuestionary } from './FapReviewWithQuestionary';
import { QuestionarySubmissionState } from '../QuestionarySubmissionState';

export class FapReviewSubmissionState extends QuestionarySubmissionState {
  [immerable] = true;
  constructor(
    public fapReview: FapReviewWithQuestionary,
    public isPreviewMode: boolean | undefined
  ) {
    super(TemplateGroupId.FAP_REVIEW, fapReview, isPreviewMode);
    this.stepIndex = this.getInitialStepIndex();
  }

  getItemId(): number {
    return this.fapReview.id;
  }

  get itemWithQuestionary() {
    return this.fapReview;
  }

  set itemWithQuestionary(item: { questionary: Questionary }) {
    this.fapReview = { ...this.fapReview, ...item };
  }
}

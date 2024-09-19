import { DefaultReviewWizardStep } from 'components/questionary/DefaultReviewWizardStep';
import { DefaultStepDisplayElementFactory } from 'components/questionary/DefaultStepDisplayElementFactory';
import { DefaultWizardStepFactory } from 'components/questionary/DefaultWizardStepFactory';
import ReviewSummary from 'components/review/ReviewSummary';
import { ReviewStatus, Sdk, TemplateGroupId } from 'generated/sdk';
import { FapReviewSubmissionState } from 'models/questionary/fapReview/FapReviewSubmissionState';
import { ItemWithQuestionary } from 'models/questionary/QuestionarySubmissionState';

import { FapReviewQuestionaryWizardStep } from './FapReviewQuestionaryWizardStep';
import { QuestionaryDefinition } from '../../QuestionaryRegistry';

export const fapReviewQuestionaryDefinition: QuestionaryDefinition = {
  groupId: TemplateGroupId.FAP_REVIEW,
  displayElementFactory: new DefaultStepDisplayElementFactory(ReviewSummary),
  wizardStepFactory: new DefaultWizardStepFactory(
    FapReviewQuestionaryWizardStep,
    new DefaultReviewWizardStep((state) => {
      const fapReviewSubmissionState = state as FapReviewSubmissionState;

      return (
        fapReviewSubmissionState.fapReview.status === ReviewStatus.SUBMITTED
      );
    })
  ),

  getItemWithQuestionary(
    api: Sdk,
    itemId: number
  ): Promise<ItemWithQuestionary | null> {
    return api.getReview({ reviewId: itemId }).then(({ review }) => {
      return review;
    });
  },
};

import FeedbackReview from 'components/feedback/FeedbackReview';
import { DefaultReviewWizardStep } from 'components/questionary/DefaultReviewWizardStep';
import { DefaultStepDisplayElementFactory } from 'components/questionary/DefaultStepDisplayElementFactory';
import { DefaultWizardStepFactory } from 'components/questionary/DefaultWizardStepFactory';
import { FeedbackStatus, Sdk, TemplateGroupId } from 'generated/sdk';
import { FeedbackSubmissionState } from 'models/questionary/feedback/FeedbackSubmissionState';
import { ItemWithQuestionary } from 'models/questionary/QuestionarySubmissionState';

import { QuestionaryDefinition } from '../../QuestionaryRegistry';
import { FeedbackWizardStep } from './FeedbackWizardStep';

export const feedbackQuestionaryDefinition: QuestionaryDefinition = {
  groupId: TemplateGroupId.FEEDBACK,

  displayElementFactory: new DefaultStepDisplayElementFactory(FeedbackReview),

  wizardStepFactory: new DefaultWizardStepFactory(
    FeedbackWizardStep,
    new DefaultReviewWizardStep(
      (state) =>
        (state as FeedbackSubmissionState).feedback.status ===
        FeedbackStatus.SUBMITTED
    )
  ),

  getItemWithQuestionary(
    api: Sdk,
    feedbackId: number
  ): Promise<ItemWithQuestionary | null> {
    return api.getFeedback({ feedbackId }).then(({ feedback }) => {
      return feedback;
    });
  },
};

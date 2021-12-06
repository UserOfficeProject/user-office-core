import FeedbackReview from 'components/feedback/FeedbackReview';
import { DefaultReviewWizardStep } from 'components/questionary/DefaultReviewWizardStep';
import { DefaultStepDisplayElementFactory } from 'components/questionary/DefaultStepDisplayElementFactory';
import { DefaultWizardStepFactory } from 'components/questionary/DefaultWizardStepFactory';
import { FeedbackStatus, TemplateGroupId } from 'generated/sdk';
import { FeedbackSubmissionState } from 'models/questionary/feedback/FeedbackSubmissionState';

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
};

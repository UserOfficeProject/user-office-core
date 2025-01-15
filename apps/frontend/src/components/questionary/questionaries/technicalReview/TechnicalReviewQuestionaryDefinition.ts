import { DefaultReviewWizardStep } from 'components/questionary/DefaultReviewWizardStep';
import { DefaultStepDisplayElementFactory } from 'components/questionary/DefaultStepDisplayElementFactory';
import { DefaultWizardStepFactory } from 'components/questionary/DefaultWizardStepFactory';
import TechnicalReviewSummary from 'components/review/TechnicalReviewSummary';
import { Sdk, TemplateGroupId } from 'generated/sdk';
import { ItemWithQuestionary } from 'models/questionary/QuestionarySubmissionState';

import { TechnicalReviewQuestionaryWizardStep } from './TechnicalReviewQuestionaryWizardStep';
import { TechnicalReviewSubmissionState } from '../../../../models/questionary/technicalReview/TechnicalReviewSubmissionState';
import { QuestionaryDefinition } from '../../QuestionaryRegistry';

export const technicalReviewQuestionaryDefinition: QuestionaryDefinition = {
  groupId: TemplateGroupId.TECHNICAL_REVIEW,
  displayElementFactory: new DefaultStepDisplayElementFactory(
    TechnicalReviewSummary
  ),
  wizardStepFactory: new DefaultWizardStepFactory(
    TechnicalReviewQuestionaryWizardStep,
    new DefaultReviewWizardStep((state) => {
      const technicalReviewSubmissionState =
        state as TechnicalReviewSubmissionState;

      return technicalReviewSubmissionState.technicalReview.submitted;
    })
  ),

  getItemWithQuestionary(
    api: Sdk,
    itemId: number
  ): Promise<ItemWithQuestionary | null> {
    return api
      .getTechnicalReview({ technicalReviewId: itemId })
      .then(({ technicalReview }) => {
        return technicalReview;
      });
  },
};

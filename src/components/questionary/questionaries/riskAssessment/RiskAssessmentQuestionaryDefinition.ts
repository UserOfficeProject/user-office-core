import { DefaultReviewWizardStep } from 'components/questionary/DefaultReviewWizardStep';
import { DefaultStepDisplayElementFactory } from 'components/questionary/DefaultStepDisplayElementFactory';
import { DefaultWizardStepFactory } from 'components/questionary/DefaultWizardStepFactory';
import RiskAssessmentReview from 'components/riskAssessment/RiskAssessmentReview';
import { RiskAssessmentStatus, TemplateCategoryId } from 'generated/sdk';
import { RiskAssessmentSubmissionState } from 'models/questionary/riskAssessment/RiskAssessmentSubmissionState';

import { QuestionaryDefinition } from '../../QuestionaryRegistry';
import { RiskAssessmentWizardStep } from './RiskAssessmentWizardStep';

export const riskAssessmentQuestionaryDefinition: QuestionaryDefinition = {
  categoryId: TemplateCategoryId.RISK_ASSESSMENT,

  displayElementFactory: new DefaultStepDisplayElementFactory(
    RiskAssessmentReview
  ),

  wizardStepFactory: new DefaultWizardStepFactory(
    RiskAssessmentWizardStep,
    new DefaultReviewWizardStep(
      (state) =>
        (state as RiskAssessmentSubmissionState).riskAssessment.status ===
        RiskAssessmentStatus.SUBMITTED
    )
  ),
};

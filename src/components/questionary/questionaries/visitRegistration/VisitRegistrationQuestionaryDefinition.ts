import { DefaultReviewWizardStep } from 'components/questionary/createDefaultReviewWizardStep';
import { DefaultStepDisplayElementFactory } from 'components/questionary/DefaultStepDisplayElementFactory';
import { DefaultWizardStepFactory } from 'components/questionary/DefaultWizardStepFactory';
import VisitRegistrationReview from 'components/visit/VisitRegistrationReview';
import { TemplateCategoryId } from 'generated/sdk';
import { VisitRegistrationSubmissionState } from 'models/questionary/visit/VisitRegistrationSubmissionState';

import { QuestionaryDefinition } from '../../QuestionaryRegistry';
import { VisitRegistrationWizardStep } from './VisitRegistrationWizardStep';

export const visitRegistrationQuestionaryDefinition: QuestionaryDefinition = {
  categoryId: TemplateCategoryId.VISIT,

  displayElementFactory: new DefaultStepDisplayElementFactory(
    VisitRegistrationReview
  ),

  wizardStepFactory: new DefaultWizardStepFactory(
    VisitRegistrationWizardStep,
    new DefaultReviewWizardStep(
      (state) =>
        (state as VisitRegistrationSubmissionState).registration
          .isRegistrationSubmitted
    )
  ),
};

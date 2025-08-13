import { DefaultReviewWizardStep } from 'components/questionary/DefaultReviewWizardStep';
import { DefaultStepDisplayElementFactory } from 'components/questionary/DefaultStepDisplayElementFactory';
import { DefaultWizardStepFactory } from 'components/questionary/DefaultWizardStepFactory';
import VisitRegistrationReview from 'components/visit/VisitRegistrationReview';
import { Sdk, TemplateGroupId, VisitRegistrationStatus } from 'generated/sdk';
import { ItemWithQuestionary } from 'models/questionary/QuestionarySubmissionState';
import { VisitRegistrationSubmissionState } from 'models/questionary/visit/VisitRegistrationSubmissionState';

import { VisitRegistrationWizardStep } from './VisitRegistrationWizardStep';
import { QuestionaryDefinition } from '../../QuestionaryRegistry';

export const visitRegistrationQuestionaryDefinition: QuestionaryDefinition = {
  groupId: TemplateGroupId.VISIT_REGISTRATION,

  displayElementFactory: new DefaultStepDisplayElementFactory(
    VisitRegistrationReview
  ),

  wizardStepFactory: new DefaultWizardStepFactory(
    VisitRegistrationWizardStep,
    new DefaultReviewWizardStep((state) => {
      return (
        (state as VisitRegistrationSubmissionState).registration.status !==
          VisitRegistrationStatus.DRAFTED &&
        (state as VisitRegistrationSubmissionState).registration.status !==
          VisitRegistrationStatus.CHANGE_REQUESTED
      );
    })
  ),

  getItemWithQuestionary(
    api: Sdk,
    [visitId, userId]: [number, number]
  ): Promise<ItemWithQuestionary | null> {
    return api
      .getVisitRegistration({ visitId, userId })
      .then(({ visitRegistration }) => visitRegistration);
  },
};

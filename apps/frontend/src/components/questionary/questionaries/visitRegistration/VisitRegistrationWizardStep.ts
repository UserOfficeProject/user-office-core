import { QuestionaryWizardStep } from 'components/questionary/DefaultWizardStepFactory';
import { VisitRegistrationStatus } from 'generated/sdk';
import { QuestionarySubmissionState } from 'models/questionary/QuestionarySubmissionState';
import { VisitRegistrationSubmissionState } from 'models/questionary/visit/VisitRegistrationSubmissionState';

export class VisitRegistrationWizardStep extends QuestionaryWizardStep {
  isItemWithQuestionaryEditable(state: QuestionarySubmissionState): boolean {
    const registrationState = state as VisitRegistrationSubmissionState;

    return (
      registrationState.registration.status ===
        VisitRegistrationStatus.DRAFTED ||
      registrationState.registration.status ===
        VisitRegistrationStatus.CHANGE_REQUESTED
    );
  }
}

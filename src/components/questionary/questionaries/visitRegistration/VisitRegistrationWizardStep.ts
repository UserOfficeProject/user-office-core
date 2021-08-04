import { QuestionaryWizardStep } from 'components/questionary/DefaultWizardStepFactory';
import { QuestionarySubmissionState } from 'models/QuestionarySubmissionState';
import { VisitSubmissionState } from 'models/VisitSubmissionState';

export class VisitRegistrationWizardStep extends QuestionaryWizardStep {
  isItemWithQuestionaryEditable(state: QuestionarySubmissionState): boolean {
    const registrationState = state as VisitSubmissionState;

    return registrationState.registration.isRegistrationSubmitted === false;
  }
}

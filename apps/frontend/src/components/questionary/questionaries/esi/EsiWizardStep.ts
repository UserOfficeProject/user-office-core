import { QuestionaryWizardStep } from 'components/questionary/DefaultWizardStepFactory';
import { ExperimentSafetySubmissionState } from 'models/questionary/experimentSafety/ExperimentSafetySubmissionState';
import { QuestionarySubmissionState } from 'models/questionary/QuestionarySubmissionState';

export class EsiWizardStep extends QuestionaryWizardStep {
  isItemWithQuestionaryEditable(state: QuestionarySubmissionState): boolean {
    const registrationState = state as ExperimentSafetySubmissionState;

    return (
      registrationState.experimentSafety.esiQuestionarySubmittedAt === null
    );
  }
}

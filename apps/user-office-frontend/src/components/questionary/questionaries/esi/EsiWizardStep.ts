import { QuestionaryWizardStep } from 'components/questionary/DefaultWizardStepFactory';
import { ProposalEsiSubmissionState } from 'models/questionary/proposalEsi/ProposalEsiSubmissionState';
import { QuestionarySubmissionState } from 'models/questionary/QuestionarySubmissionState';

export class EsiWizardStep extends QuestionaryWizardStep {
  isItemWithQuestionaryEditable(state: QuestionarySubmissionState): boolean {
    const registrationState = state as ProposalEsiSubmissionState;

    return registrationState.esi.isSubmitted === false;
  }
}

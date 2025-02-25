import { QuestionaryWizardStep } from 'components/questionary/DefaultWizardStepFactory';
import { QuestionarySubmissionState } from 'models/questionary/QuestionarySubmissionState';
import { SampleEsiSubmissionState } from 'models/questionary/experimentSample/SampleEsiSubmissionState';

export class SampleEsiWizardStep extends QuestionaryWizardStep {
  isItemWithQuestionaryEditable(state: QuestionarySubmissionState): boolean {
    const sampleEsiState = state as SampleEsiSubmissionState;

    return sampleEsiState.esi.isSubmitted === false;
  }
}

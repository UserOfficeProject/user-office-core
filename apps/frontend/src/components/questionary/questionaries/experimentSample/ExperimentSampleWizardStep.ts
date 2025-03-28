import { QuestionaryWizardStep } from 'components/questionary/DefaultWizardStepFactory';
import { ExperimentSampleSubmissionState } from 'models/questionary/experimentSample/ExperimentSampleSubmissionState';
import { QuestionarySubmissionState } from 'models/questionary/QuestionarySubmissionState';

export class ExperimentSampleWizardStep extends QuestionaryWizardStep {
  isItemWithQuestionaryEditable(state: QuestionarySubmissionState): boolean {
    const sampleEsiState = state as ExperimentSampleSubmissionState;

    return sampleEsiState.experimentSample.isEsiSubmitted === false;
  }
}

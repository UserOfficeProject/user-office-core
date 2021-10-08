import { QuestionaryStep } from 'generated/sdk';
import { WizardStep } from 'models/questionary/QuestionarySubmissionState';

import { SampleQuestionaryWizardStep } from './SampleQuestionaryWizardStep';

export class SampleWizardStepFactory {
  getWizardSteps(questionarySteps: QuestionaryStep[]): WizardStep[] {
    const wizardSteps: WizardStep[] = [];

    questionarySteps.forEach((step, index) =>
      wizardSteps.push(new SampleQuestionaryWizardStep(step, index))
    );

    return wizardSteps;
  }
}

import { QuestionaryStep } from 'generated/sdk';
import { WizardStep } from 'models/questionary/QuestionarySubmissionState';

import { GenericTemplateQuestionaryWizardStep } from './GenericTemplateQuestionaryWizardStep';

export class GenericTemplateWizardStepFactory {
  getWizardSteps(questionarySteps: QuestionaryStep[]): WizardStep[] {
    const wizardSteps: WizardStep[] = [];

    questionarySteps.forEach((step, index) =>
      wizardSteps.push(new GenericTemplateQuestionaryWizardStep(step, index))
    );

    return wizardSteps;
  }
}
